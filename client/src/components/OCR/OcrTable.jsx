import React, { useState, useEffect } from 'react'
import { MuiThemeProvider, TableHeader, Table, TableRow, TableHeaderColumn, TableRowColumn, TableBody, TableFooter } from 'material-ui'
import Holes from './Holes'
import axios from 'axios';

const OcrTable = () => {
    const [output, setOutput] = useState()
    const [fileName, setFileName] = useState("")
    const [file, setFile] = useState()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetch("/api/demo/default")
            .then((response) => response.json())
            .then(data => {
                let results = []
                Object.keys(data).forEach(e => {
                    results.push({
                        hole: e.substring(1, 2),
                        column: e.substring(3, e.length - 1),
                        row: e.substring(e.length - 1),
                        result: data[e].result,
                        conf: data[e].conf,
                        error: data[e].error
                    })
                })
                setOutput(results)
            })
    }, [])

    const handleDownload = async (event) => {
        event.preventDefault();

        try {
            // const response = await axios.get("/api/demo/template")
            //     .then(console.log(response))
            axios({
                url: '/api/demo/template', //your url
                method: 'GET',
                responseType: 'blob', // important
            }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'template.jpg'); //or any other extension
                document.body.appendChild(link);
                link.click();
            });
        }
        catch (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error123', error.message);
            }
            console.log(error.config);
        }
    }

    const handleSubmitTemplate = async (event) => {
        event.preventDefault()
        setIsLoading(true)
        let formData = new FormData()
        formData.append('upload', file)

        axios.post('api/demo/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(data => {
                let results = []
                Object.keys(data.data).forEach(e => {
                    results.push({
                        hole: e.substring(1, 2),
                        column: e.substring(3, e.length - 1),
                        row: e.substring(e.length - 1),
                        result: data.data[e].result,
                        conf: data.data[e].conf,
                        error: data.data[e].error
                    })
                })
                setIsLoading(false)
                setOutput(results)
            })
    }

    const browseButton = () => {
        if (!fileName) return "Browse"
        else return fileName
    }

    if (!output) {
        return <h1>Loading...</h1>
    }

    if (isLoading) {
        return <h1>Loading...</h1>
    }
    return (
        <div id="Ocr-Table">
            <MuiThemeProvider >
                <Table height={`${window.innerHeight - 300}px`} data={output} fixedHeader={true}>
                    <TableHeader adjustForCheckbox={false} enableSelectAll={false} displaySelectAll={false}>
                        <TableRow>
                            <TableHeaderColumn>From</TableHeaderColumn>
                            <TableHeaderColumn>Distance</TableHeaderColumn>
                            <TableHeaderColumn>ClubL</TableHeaderColumn>
                            <TableHeaderColumn>ClubR</TableHeaderColumn>
                            <TableHeaderColumn>L/R</TableHeaderColumn>
                            <TableHeaderColumn>S/P</TableHeaderColumn>
                            <TableHeaderColumn>Result</TableHeaderColumn>
                            <TableHeaderColumn>Recovery</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        <Holes data={output} />
                    </TableBody>
                    <TableFooter adjustForCheckbox={false}>
                        <TableRow>
                            <TableRowColumn colSpan="2" style={{ textAlign: "center" }}>
                                <div id="download" onClick={handleDownload}>
                                    Download Template
                                </div>
                            </TableRowColumn>
                            <TableRowColumn colSpan="1" style={{ textAlign: "center" }}>
                                <form id="uploadForm" onSubmit={handleSubmitTemplate}>
                                    <label>
                                        <div id="browse">
                                            {browseButton()}
                                        </div>
                                        <input id="browse-hide" type="file" name="file" value={fileName} onChange={(e) => {
                                            setFile(e.target.files[0])
                                            setFileName(e.target.value)
                                        }} />
                                    </label>
                                    <label>
                                        <div id="upload">
                                            Upload Completed Template
                                        </div>
                                        <input id="upload-hide" type="submit" value="Upload" />
                                    </label>
                                </form>
                            </TableRowColumn>
                        </TableRow>
                    </TableFooter>
                </Table>
            </MuiThemeProvider>
        </div>
    )
}

export default OcrTable
