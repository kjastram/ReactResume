import numpy as np
import pandas as pd
import cv2 as cv
import pickle
import os
from keras.models import load_model
import json
from os.path import isfile, join
import shutil

debug = False

#------Task1
debug = False

def show_image(img, title = "Image", force = False):
    if(debug == False and force == False): return
    cv.imshow(title, cv.resize(img, (0,0), fx=1.5, fy=1.5))
    cv.waitKey(0)
    cv.destroyAllWindows()

    # Deskew image from https://gist.github.com/russss/922be97d2a65eb534744c5a4054ff88d
def deskew(im, max_skew=10):
    height, width = im.shape

    # Create a grayscale image and denoise it
    #im_gs = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
    im_gs = cv.fastNlMeansDenoising(im, h=3)

    # Create an inverted B&W copy using Otsu (automatic) thresholding
    im_bw = cv.threshold(im_gs, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU)[1]

    # Detect lines in this image. Parameters here mostly arrived at by trial and error.
    lines = cv.HoughLinesP(
        im_bw, 1, np.pi / 180, 200, minLineLength=width / 12, maxLineGap=width / 150
    )

    # Collect the angles of these lines (in radians)
    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angles.append(np.arctan2(y2 - y1, x2 - x1))

    # If the majority of our lines are vertical, this is probably a landscape image
    landscape = np.sum([abs(angle) > np.pi / 4 for angle in angles]) > len(angles) / 2

    # Filter the angles to remove outliers based on max_skew
    if landscape:
        angles = [
            angle
            for angle in angles
            if np.deg2rad(90 - max_skew) < abs(angle) < np.deg2rad(90 + max_skew)
        ]
    else:
        angles = [angle for angle in angles if abs(angle) < np.deg2rad(max_skew)]

    if len(angles) < 5:
        # Insufficient data to deskew
        return im

    # Average the angles to a degree offset
    angle_deg = np.rad2deg(np.median(angles))

    # If this is landscape image, rotate the entire canvas appropriately
    if landscape:
        if angle_deg < 0:
            im = cv.rotate(im, cv.ROTATE_90_CLOCKWISE)
            angle_deg += 90
        elif angle_deg > 0:
            im = cv.rotate(im, cv.ROTATE_90_COUNTERCLOCKWISE)
            angle_deg -= 90
    #print('Image rotated by {}'.format(angle_deg))
    # Rotate the image by the residual offset
    M = cv.getRotationMatrix2D((width / 2, height / 2), angle_deg, 1)
    im = cv.warpAffine(im, M, (width, height), borderMode=cv.BORDER_REPLICATE)
    return im

def image_is_white_only(img):
    inset = 3
    test_img = img[inset:img.shape[0] - inset, inset:img.shape[1] - inset]
    test_img_bw = cv.threshold(test_img, 240, 255, cv.THRESH_BINARY)[1]
    
    #show_image(test_img_bw, force = True)
    white_pixels = cv.countNonZero(test_img_bw)
    total_pixels = test_img_bw.shape[0] * test_img_bw.shape[1]

    return (white_pixels / total_pixels > 0.98)

def get_tables(img): 
    # scale image to 3400px width
    target_scaling = 3400/img.shape[0]
    img = cv.resize(img, None, fx=target_scaling, fy=target_scaling, interpolation = cv.INTER_LINEAR)
    # deskew image
    img = deskew(img)
    show_image(img)
    
    # Apply adaptiveThreshold at the bitwise_not of gray, notice the ~ symbol
    bw = cv.adaptiveThreshold(~img,255,cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY,15,-2)
    show_image(bw)
    horizontal = bw.copy()
    
    # find horizontal lines
    scale = 50
    horizontalSize = (int)(horizontal.shape[0] / scale);
    horizontalStructure = cv.getStructuringElement(cv.MORPH_RECT, (horizontalSize,1))
    # TODO: Better ratio between erode and dilate needed. 
    horizontal = cv.erode(horizontal, horizontalStructure, (-1, -1))
    horizontal = cv.dilate(horizontal, horizontalStructure, (-1, -1))
    
    show_image(horizontal)
    
    # find vertical lines
    vertical = bw.copy()
    verticalSize = (int)(vertical.shape[1] / scale);
    verticalStructure = cv.getStructuringElement(cv.MORPH_RECT, (1,verticalSize));
    vertical = cv.erode(vertical, verticalStructure, (-1, -1))
    vertical = cv.dilate(vertical, verticalStructure, (-1, -1))
    
    show_image(vertical)
    
    # combine horizontal + vertical
    mask = horizontal + vertical
    show_image(mask)
    
    # find the joints between the lines of the tables, we will use this information in order to descriminate tables from pictures (tables will contain more than 4 joints while a picture only 4 (i.e. at the corners))
    joints = cv.bitwise_and(horizontal, vertical)
    show_image(joints)
    
    # find external contours from the mask, which most probably will belong to tables or to images
    # RETR_EXTERNAL
    img, contours, hierarchy = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    contours_poly = [None] * len(contours)
    bound_rect = [None] * len(contours)
    tables = []
    ordering_orig = []
    img_with_rects = cv.cvtColor(img.copy(),cv.COLOR_GRAY2RGB)

    for i in range(0, len(contours)): 
        # find the area of each contour
        area = cv.contourArea(contours[i])

        # filter individual lines of blobs that might exist and they do not represent a table
        if(area < 400000 or area > 500000): 
            continue

        contours_poly[i] = cv.approxPolyDP((contours[i]), 3, True)
        bound_rect[i] = cv.boundingRect((contours_poly[i]))

        # add margin to bounding rect
        r = (bound_rect[i][0] - 10, bound_rect[i][1] - 10, bound_rect[i][2] + 20, bound_rect[i][3] + 20)
        #if(r[1] < 250 or r[2] < 60 or r[3] < 40): 
        #    continue

        roi = joints[int(r[1]):int(r[1]+r[3]), int(r[0]):int(r[0]+r[2])]

        joints_contours, joints_hierarchy = cv.findContours(roi, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)

        if(joints_hierarchy is None or len(joints_hierarchy[0]) <= 4):
            continue

        tables.insert(0, img[int(r[1]):int(r[1]+r[3]), int(r[0]):int(r[0]+r[2])])
        ordering_orig.insert(0, r)
        
        #cv.rectangle(img_with_rects,(r[0],r[1]),(r[0]+r[2],r[1]+r[3]),(0,255,0), 1, 8, 0)
        cv.drawContours(img_with_rects, contours, i, (0,255,0), 3)
    show_image(img_with_rects)
    #tables = [tables[x] for x in [0, 3, 6, 1, 4, 7, 2, 5, 8]]
    
    # Add index to array 
    ordering = [[*x, i] for i,x in enumerate(ordering_orig)] 
    # Order by X-coordinate first
    x_ordering = sorted(ordering, key=lambda coords: coords[0])
    # Map the values to the x-coordinate for grouping
    single_ordering = list(map(lambda x: x[0], x_ordering))
    # X-threshold in pixels
    threshold = 50
    # Group values together where difference is <= th, this groups by "row"
    group = np.split(single_ordering, np.where(np.diff(single_ordering) > threshold)[0]+1)
    # Create a map from the group for easier sorting later. Result is mapping of y-pixel values to the corresponding group (row)
    indexMap = dict()
    for i in range(0, len(group)):
        for j in range(0, len(group[i])): 
            indexMap[group[i][j]] = i
    # Sort by Y-coordinate
    new_ordering = sorted(ordering, key=lambda coords: coords[1])
    # Then sort by column
    new_ordering = sorted(new_ordering, key=lambda coords: indexMap[coords[0]])
    new_ordering = [[indexMap[x[0]], x[4]] for i,x in enumerate(new_ordering)] 
    print([x[0] for i,x in enumerate(new_ordering)])
    # Add columns as second index
    #last_row = None
    #next_col = None
    #for i in range(0, len(new_ordering)): 
    #    item = new_ordering[i]
    #    if(last_row != item[0]):
    #        next_col = 0
    #        last_row = item[0]

    #    new_ordering[i] = [item[0], next_col, item[1]]
    #    next_col = next_col + 1
    # Result is array sorted by column first, row second with the index at new_ordering[i][2]
    
    tables = [tables[x[1]] for i,x in enumerate(new_ordering)]
    return tables, img_with_rects
    
def get_table_cells(img): 
    # scale image to 600px width
    target_scaling = 600/img.shape[0]
    img = cv.resize(img, None, fx=target_scaling, fy=target_scaling, interpolation = cv.INTER_LINEAR)
    # deskew image
    #img = deskew(img)
    show_image(img)
    
    # Apply adaptiveThreshold at the bitwise_not of gray, notice the ~ symbol
    bw = cv.adaptiveThreshold(~img,255,cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY,15,-2)
    show_image(bw)
    horizontal = bw.copy()
    
    # find horizontal lines
    scale = 20
    horizontalSize = (int)(horizontal.shape[0] / scale);
    horizontalStructure = cv.getStructuringElement(cv.MORPH_RECT, (horizontalSize,1))
    # TODO: Better ratio between erode and dilate needed. 
    horizontal = cv.erode(horizontal, horizontalStructure, (-1, -1))
    horizontal = cv.dilate(horizontal, cv.getStructuringElement(cv.MORPH_RECT, (int(horizontalSize*1.5),1)), (-1, -1))
    
    show_image(horizontal)
    
    # find vertical lines
    vertical = bw.copy()
    verticalSize = (int)(vertical.shape[1] / scale);
    verticalStructure = cv.getStructuringElement(cv.MORPH_RECT, (1,verticalSize));
    vertical = cv.erode(vertical, verticalStructure, (-1, -1))
    vertical = cv.dilate(vertical, verticalStructure, (-1, -1))
    
    show_image(vertical)
    
    # combine horizontal + vertical
    mask = horizontal + vertical
    show_image(mask)
    
    # find the joints between the lines of the tables, we will use this information in order to descriminate tables from pictures (tables will contain more than 4 joints while a picture only 4 (i.e. at the corners))
    joints = cv.bitwise_and(horizontal, vertical)
    show_image(joints)
    
    # find external contours from the mask, which most probably will belong to tables or to images
    # RETR_EXTERNAL
    contours, hierarchy = cv.findContours(mask, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

    contours_poly = [None] * len(contours)
    bound_rect = [None] * len(contours)
    cells = []
    ordering_orig = []
    img_with_rects = cv.cvtColor(img.copy(),cv.COLOR_GRAY2RGB)
    
    for i in range(0, len(contours)): 
        # find the area of each contour
        area = cv.contourArea(contours[i])

        # filter individual lines of blobs that might exist and they do not represent a cell
        if(area < 2000 or area > 8000): 
            continue

        contours_poly[i] = cv.approxPolyDP((contours[i]), 3, True)
        bound_rect[i] = cv.boundingRect((contours_poly[i]))
        r = bound_rect[i]

        #roi = joints[int(r[1]):int(r[1]+r[3]), int(r[0]):int(r[0]+r[2])]
        #joints_contours, joints_hierarchy = cv.findContours(roi, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
        #if(joints_hierarchy is None or len(joints_hierarchy[0]) <= 0):
        #    continue

        cells.insert(0, img[int(r[1]):int(r[1]+r[3]), int(r[0]):int(r[0]+r[2])].copy())
        ordering_orig.insert(0, r)

        cv.rectangle(img_with_rects,(r[0],r[1]),(r[0]+r[2],r[1]+r[3]),(0,255,0), 1, 8, 0)
        #cv.drawContours(img_with_rects, contours, i, (0,255,0), 3)
    
    # Add index to array 
    ordering = [[*x, i] for i,x in enumerate(ordering_orig)] 
    # Order by Y-coordinate first
    y_ordering = sorted(ordering, key=lambda coords: coords[1])
    # Map the values to the y-coordinate for grouping
    single_ordering = list(map(lambda x: x[1], y_ordering))
    # Y-threshold in pixels
    threshold = 20
    # Group values together where difference is <= th, this groups by "row"
    group = np.split(single_ordering, np.where(np.diff(single_ordering) > threshold)[0]+1)
    # Create a map from the group for easier sorting later. Result is mapping of y-pixel values to the corresponding group (row)
    indexMap = dict()
    for i in range(0, len(group)):
        for j in range(0, len(group[i])): 
            indexMap[group[i][j]] = i
    # Sort by x-coordinate
    new_ordering = sorted(ordering, key=lambda coords: coords[0])
    # Then sort by row
    new_ordering = sorted(new_ordering, key=lambda coords: indexMap[coords[1]])
    new_ordering = [[indexMap[x[1]], x[4]] for i,x in enumerate(new_ordering)] 
    # Add columns as second index
    last_row = None
    next_col = None
    for i in range(0, len(new_ordering)): 
        item = new_ordering[i]
        if(last_row != item[0]):
            next_col = 0
            last_row = item[0]

        new_ordering[i] = [item[0], next_col, item[1]]
        next_col = next_col + 1
    # Result is array sorted by row first, column second with the index at new_ordering[i][2]
    
    cells = [cells[x[2]] for i,x in enumerate(new_ordering)]
    
    show_image(img_with_rects)
    return cells, img_with_rects, new_ordering

def save_tables(dir_name, table_cells):
    if(os.path.isdir(dir_name)):
            print("removed!")
            shutil.rmtree(dir_name)
            os.mkdir(dir_name)
    for i in range(0, len(table_cells)):
        cells = table_cells[i]        
        hole_nr = (i * 3 + 1) % 10# 0 .. 1, 1 .. 4, 2 .. 7, 3 .. 2, 4 .. 5, 5 .. 8
        save_table_cells(dir_name, cells, i + 1)
    print("Finished saving holes!             ")

def save_table_cells(dir_name, cells, hole_nr):
    for i in range(0, len(cells)):
        cell = cells[i]
        if(image_is_white_only(cell)): 
            continue
        row = int(i / 8)
        col = i % 8
        name = {
            0: "H{}_From{}",
            1: "H{}_Distance{}",
            2: "H{}_ClubL{}",
            3: "H{}_ClubR{}",
            4: "H{}_LR{}",
            5: "H{}_SP{}",
            6: "H{}_Result{}",
            7: "H{}_Recovery{}",
        }[col].format(hole_nr, row)
        #print('Saving image {} of hole {}\r'.format(i + 1, hole_nr), end="")
        cv.imwrite(os.path.join(dir_name, name+".jpg"), cell)

def convert_image_to_cells(image_path, output_dir): 
    print("Loading image: {}".format(image_path))
    orig_img = cv.imread(image_path, 0)
    tables, annotated_img = get_tables(orig_img)

    table_cells = []
    annotated_tables = []
    has_error = False
    if(len(tables) != 9):
        print("Something went wrong with the table detection! Only {} out of 9 tables found!".format(len(tables)))
    else: 
        for i in range(0, len(tables)):
            show_image(tables[i])

            cells, annotated_table, new_ordering = get_table_cells(tables[i])

            # discard the header
            cells = cells[7:]
            if(len(cells) != 80): 
                print("Something went wrong with the cell detection in hole {}! Only {} out of 80 cells found!".format(i + 1, len(cells)))
                has_error = True
            table_cells.append(cells)
            annotated_tables.append(annotated_table)

    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
    
    cv.imwrite(os.path.join(output_dir, "summary_full.jpg"), annotated_img)
    for i in range(0, len(annotated_tables)):
        cv.imwrite(os.path.join(output_dir, "summary_{}.jpg".format(i)), annotated_tables[i])
    if(has_error == False): 
        save_tables(output_dir, table_cells)
        print("Finished converting image!")

image_paths = [f for f in os.listdir("./ocrDemo/samples/") if not f.startswith('.')]
image_paths = ["./ocrDemo/samples/"+f for f in image_paths]
print(image_paths)
for i in range(0, len(image_paths)):
    convert_image_to_cells(image_paths[i], "./ocrDemo/new_output_"+str(i))

#-----Part 2

# Deskewing tokens because MNIST data is deskewed as well.
# Source: https://cristianpb.github.io/blog/image-preprocessing
def deskew_digit(img, SZ):
    m = cv.moments(img)
    if abs(m['mu02']) < 1e-2:
        # no deskewing needed. 
        return img.copy()
    # Calculate skew based on central momemts. 
    skew = m['mu11']/m['mu02']
    # Calculate affine transform to correct skewness. 
    M = np.float32([[1, skew, -0.5*SZ*skew], [0, 1, 0]])
    # Apply affine transform
    img = cv.warpAffine(img, M, (SZ, SZ), flags=cv.WARP_INVERSE_MAP | cv.INTER_LINEAR)
    return img

def get_mnist_style_digit_from_roi(im, hints = {}):
    old_size = im.shape[:2] # old_size is in (height, width) format

    target_size_of_symbol = 20
    if(hints.get("digits")):
        target_size_of_symbol = 16
    elif(hints.get("letters")):
        target_size_of_symbol = 20
    elif(hints.get("checkbox")):
        target_size_of_symbol = 26
        
    ratio = float(target_size_of_symbol)/max(old_size)
    new_size = tuple([int(x*ratio) for x in old_size])

    # new_size should be in (width, height) format
    im = cv.resize(im, (new_size[1], new_size[0]))

    # calculate border margins
    delta_w = 28 - new_size[1]
    delta_h = 28 - new_size[0]
    top, bottom = delta_h//2, delta_h-(delta_h//2)
    left, right = delta_w//2, delta_w-(delta_w//2)

    # add border to "scale" image
    im = cv.copyMakeBorder(im, top, bottom, left, right, cv.BORDER_CONSTANT,
        value=(0,0,0))
    
    show_image(im)
    
    #im = cv.resize(im, (18, 18), interpolation=cv.INTER_AREA)
    #im = cv.copyMakeBorder(im, 5, 5, 5, 5, cv.BORDER_CONSTANT, value = (0,0,0)) 
    #im = cv.dilate(im, (2, 2))
    if(hints.get("digits")):
        im = deskew_digit(im, 28)
    else: 
        # THIS NEEDS TO BE DONE BECAUSE THE LETTER NN IS TRAINED WITH TRANSPOSED DATA FOR WHATEVER REASON!
        #(h, w) = im.shape[:2]
        #center = (w / 2, h / 2)

        # Perform the clockwise rotation holding at the center 90 degrees
        #M = cv.getRotationMatrix2D(center, 90, 1.0)
        #im = cv.warpAffine(im, M, (h, w))

        # flip horizontally
        #im = cv.flip(im, 0)
        pass
        
    show_image(im)

    #plt.imshow(roi, cmap=plt.cm.gray_r, interpolation='nearest')
    return im

# Returns an array of MNIST-compatible tokens found in the cell image
def get_tokens_from_cells(im, hints = {}):
    # remove some pixels from the border because the table might be visible
    inset = 3
    im = im[inset:im.shape[0] - inset, inset:im.shape[1] - inset]
    # add white border to image 
    border = 10
    im = cv.copyMakeBorder(im, border, border, border, border, cv.BORDER_CONSTANT, value = (255,255,255)) 
    # convert to grayscale and apply gaussian filtering for better threshold detection
    im_gray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
    im_gray = cv.GaussianBlur(im_gray, (5, 5), 0)
    
    #im_th = cv.Canny(im_gray,140,150)
    #show_image(im_th)
    # Threshold the image
    #ret, im_th = cv.threshold(im_gray, 220, 255, cv.THRESH_BINARY_INV)
    #ret, im_th = cv.threshold(im_gray,0,255,cv.THRESH_BINARY_INV+cv.THRESH_OTSU)
    #im_th = cv.adaptiveThreshold(im_gray,255,cv.ADAPTIVE_THRESH_GAUSSIAN_C,\
    #        cv.THRESH_BINARY_INV,9,2)
    
    # Calculate two different sets of thresholds to combine them later
    ret, im_th_1 = cv.threshold(im_gray,0,255,cv.THRESH_BINARY_INV+cv.THRESH_OTSU)
    im_th_2 = cv.adaptiveThreshold(im_gray,255,cv.ADAPTIVE_THRESH_GAUSSIAN_C,\
            cv.THRESH_BINARY_INV,25,2)
    #ret, im_th_3 = cv.threshold(im_gray, 220, 255, cv.THRESH_BINARY_INV)

    show_image(im_th_1)
    show_image(im_th_2)
    #show_image(im_th_3)

    # combine thresholds to form single image
    im_th = im_th_1 & im_th_2
    if(hints.get("checkbox")): 
        im_th = im_th_1
    #im_th = im_th_1
    #im_th = cv.erode(im_th, (8, 8))

    show_image(im_th)

    # find external contours in the image
    ctrs, hier = cv.findContours(im_th, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    # get rectangles containing each contour
    rects = [cv.boundingRect(ctr) for ctr in ctrs]

    res = []
    has_too_big_area = False

    # for each rectangular region, check if it is an actual token
    for i in range(0, len(rects)):
        rect = rects[i]
        
        # check if area is valid --> hard to define cut off points. 
        # TODO: Maybe consider using aspect ratio too..
        area = cv.contourArea(ctrs[i])
        if(area > 1100):
            #print("Area {}px is larger than 1100px".format(area))
            has_too_big_area = True
            continue
        elif(area < 50):
            #print("Area {}px is smaller than 100px".format(area))
            continue
            
        # draw the rectangles in the original image
        cv.rectangle(im, (rect[0], rect[1]), (rect[0] + rect[2], rect[1] + rect[3]), (0, 255, 0), 3) 
        
        # take thresholded image to extract token (region of interest)
        # Alternative: take im_gray here and threshold it yourself again
        roi = im_th[rect[1]:rect[1]+rect[3], rect[0]:rect[0]+rect[2]]
        
        #ret, roi = cv.threshold(roi, 210, 255, cv.THRESH_BINARY_INV)
        #ret, roi = cv.threshold(roi,0,255,cv.THRESH_BINARY_INV+cv.THRESH_OTSU)
        #roi = cv.adaptiveThreshold(roi,255,cv.ADAPTIVE_THRESH_MEAN_C,\
        #    cv.THRESH_BINARY_INV,9,2)

        # convert region of interest to MNIST compatible image
        roi = get_mnist_style_digit_from_roi(roi, hints)
        
        #show_image(roi)

        # append image and x-coordinate (needed for sorting)
        res.append({
            "image": roi,
            "x": rect[0]
        })
    #show_image(im)
    
    # TODO: Return some kind of indicator of confidence
    # Return the images sorted by their X-coordinate
    return [x["image"] for x in sorted(res, key = lambda x: x["x"])], has_too_big_area

# Returns the predictions and confidences for all the given token using a given nn function
def get_predictions_from_tokens(tokens, ann_func, hints = {}): 
    predictions = []
    confidences = []
    for token in tokens: 
        res, conf = ann_func(token)
        predictions.append(res)
        confidences.append(float(conf))
    return predictions, confidences

# Turns predictions into strings using a given mapping dataframe (1. column is the predicted value, 2. column is the ASCII value)
def get_string_from_predictions(predictions, mapping):
    res = ""
    for prediction in predictions: 
        res += chr(mapping.loc[mapping[0] == prediction, 1].iloc[0])
    return res

# Returns the prediction and confidence of a token using a given Keras nn. Also applies normalization!
def get_prediction_from_keras_nn(nn, token):
    token = token.astype('float32')
    token /= 255
    res = nn.predict_classes(token.reshape((1, 28, 28, 1)))[0]
    conf = np.max(nn.predict(token.reshape((1, 28, 28, 1))))
    return res, conf

# Returns the prediction and confidence of a token using a given SKLearn nn. 
def get_prediction_from_sklearn_nn(nn, token):
    res = nn.predict(token.reshape(784, -1).flatten().reshape(1, -1))[0]
    conf = np.max(nn.predict_proba(token.reshape(784, -1).flatten().reshape(1, -1)))
    return res, conf

def get_prediction_from_checkbox(token): 
    # TODO: Better algorithm, TODO better conf 
    percent_white = np.count_nonzero(token) / (token.shape[0] * token.shape[1])
    return 1 if percent_white > 0.6 else 0, 1

def folder_to_html_file(value_dict, cell_image_path, outputname): 
    res = "<html>"
    for table_index in range(0,9):
        res += "<table border='1'>"
        res += "<tr>"
        for heading in ["From", "Distance", "ClubL", "ClubR", "L/R", "S/P", "Result", "Recovery"]:
            res += "<th>"+heading+"</th>"
        res += "</tr>"

        for row_index in range(0, 11):
            res += "<tr>"
            for category in ["From", "Distance", "ClubL", "ClubR", "LR", "SP", "Result", "Recovery"]: 
                name = "H{}_{}{}".format(table_index+1, category, row_index)
                image_filename = os.path.join(cell_image_path, name+".jpg")
                content = value_dict.get(name)
                
                image_exists = os.path.isfile(image_filename)
                content_exists = content != None
                res += "<td style=\"background-color: {}\">".format(
                    "red" if (image_exists and not content_exists) or (content_exists and content.get("error")) else "white")
                if(image_exists):
                    res += "<img src='{}' />".format(image_filename)
                if(content_exists and content.get("result") != None): 
                    res += "<input type=\"text\" value=\"{}\" />".format(content["result"])
                res += "</td>"
            res += "</tr>"
        res += "</table>"
    res += "</html>"

    html_file = open(outputname,"w")
    html_file.write(res)
    html_file.close()
    
def folder_to_predictions(dirname, actual_dict = None):
    #ann_digits = pickle.load(open('my_ann_digits.sav', 'rb'))
    ann_digits_mapping = pd.read_csv('./ocrDemo/emnist/emnist-mnist-mapping.txt', sep = ' ', header=None)
    #ann_letters = pickle.load(open('ann_letters.sav', 'rb'))
    ann_letters_mapping = pd.read_csv('./ocrDemo/emnist/emnist-letters-mapping.txt', sep = ' ', header=None)
    cnn_digits = load_model('./ocrDemo/cnn_digits.h5')
    cnn_letters = load_model('./ocrDemo/cnn_letters.h5')

    tokens_dirname = dirname + "_tokens"
    
    if os.path.exists(tokens_dirname):
        for file in os.listdir(tokens_dirname):
            os.remove(os.path.join(tokens_dirname, file))
    else:
        os.mkdir(tokens_dirname)
            
    result_dict = {}
    total = []
    not_enough_conf = []
    too_big = []
    empty = []
    correct = []
    incorrect_same = []
    incorrect_diff = []
    for filename in os.listdir(dirname):
        filename_no_ext, file_extension = os.path.splitext(filename)
        ann_func = None
        mapping = None
        hints = {}
        if ".jpg" not in filename:
            continue
        if any(s in filename for s in ["Distance", "ClubL"]):
            #print("Digit")
            ann_func = lambda token, nn = cnn_digits: get_prediction_from_keras_nn(nn, token)
            mapping = ann_digits_mapping
            hints["digits"] = True
        elif any(s in filename for s in ["From", "ClubR", "LR", "SP", "Result"]):
            #print("Letter")
            ann_func = lambda token, nn = cnn_letters: get_prediction_from_keras_nn(nn, token)
            mapping = ann_letters_mapping
            hints["letters"] = True
        elif "Recovery" in filename: 
            #print("Checkbox")
            ann_func = lambda token: get_prediction_from_checkbox(token)
            mapping = pd.DataFrame(np.array([[0,78], [1,89]]))
            hints["checkbox"] = True
        else: 
            #print("ERROR: Wrong file!")
            continue
        total.append(filename)
        
        result = None

        # Read the input image 
        im = cv.imread(os.path.join(dirname, filename))
        #show_image(im, force = True)
        tokens, has_too_big_area = get_tokens_from_cells(im, hints)
        
        for i in range(0, len(tokens)):
            cv.imwrite(os.path.join(tokens_dirname, filename_no_ext+"_{}.jpg".format(i)), tokens[i])

        if(has_too_big_area): 
            #print(filename, "Somethings too big here!")
            too_big.append(filename)
            continue

        predictions, conf = get_predictions_from_tokens(tokens, ann_func, hints)
        if(len(predictions) == 0):
            #print(filename,"Must be empty?")
            empty.append(filename)
        elif(np.min(conf) > 0.0): 
            #print(predictions, conf)
            result = get_string_from_predictions(predictions, mapping)

            if(actual_dict != None):
                if(actual_dict[filename] == result):
                    correct.append(filename)
                elif(len(actual_dict[filename]) == len(result)): 
                    incorrect_same.append(filename)
                else: 
                    incorrect_diff.append(filename)
            else: 
                correct.append(filename)

                
            result_dict[filename_no_ext] = {
                "result": result,
                "conf": conf, 
                "error": 1 if ((actual_dict != None and actual_dict[filename] != result) or np.min(conf) < 0.8) else 0
            }

            #print(filename, result, conf)
            #correct += 1
        else: 
            #print(filename, "Not enough confidence {}".format(conf))
            not_enough_conf.append(filename)
            
    
    with open(dirname+'.json', 'w') as fp:
        json.dump(result_dict, fp, indent=4, separators=(',', ': '))

    print("Total:          {}".format(len(total)))
    print("Too Big:        {}".format(len(too_big)))
    print("Bad Prediction: {}".format(len(not_enough_conf)))
    print("Empty:          {}".format(len(empty)))
    print("Correct:        {}".format(len(correct)))
    if(actual_dict != None):
        print("Incorrect same: {}".format(len(incorrect_same)))
        print("Incorrect diff: {}".format(len(incorrect_diff)))
    print("Ratio:          {}".format(len(correct)/len(total)))

    for filename in [*too_big, *not_enough_conf, *incorrect_same, *incorrect_diff]:
        im = cv.imread(os.path.join(dirname, filename))
        show_image(im)


dirname = "./ocrDemo/new_output_0"

actual_dict = None
#with open('samples/sample1_rotated_200dpi.json', 'r') as fp:
#    actual_dict = json.load(fp)
folder_to_predictions(dirname)


with open(dirname+'.json', 'r') as fp:
    value_dict = json.load(fp)

folder_to_html_file(value_dict, dirname, dirname+".html")
