import UploadArea from '../UploadArea';

export default function UploadAreaExample() {
  return (
    <div className="p-4">
      <UploadArea
        onFileUpload={(result) => {
          console.log('Upload result in example:', result);
        }}
        onUploadStart={() => {
          console.log('Upload started in example');
        }}
      />
    </div>
  );
}