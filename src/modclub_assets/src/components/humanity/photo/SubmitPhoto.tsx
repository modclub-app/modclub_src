import { useEffect, useState } from 'react';
import {useDropzone} from 'react-dropzone';

const thumbsContainer : React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb : React.CSSProperties = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner : React.CSSProperties = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img : React.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

export default function SubmitPhoto() {
  const [files, setFiles] = useState([]);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
      accept: 'image/*',
      onDrop: acceptedFiles => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        })));
      }
    });
    
    const thumbs = files.map(file => (
      <div style={thumb} key={file.name}>
        <div style={thumbInner}>
          <img
            src={file.preview}
            style={img}
          />
        </div>
      </div>
    ));
  
    useEffect(() => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);
  
  return (
    <div className="column">
      <h1>Submit a photo of yourself. It should be well lit and head on.</h1>
      <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
      {thumbs}
    </div>
  );
}