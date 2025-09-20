import UploadArea from '../UploadArea';

export default function UploadAreaExample() {
  return (
    <div className="p-4">
      <UploadArea
        onFileUpload={(file) => {
          console.log('File uploaded in example:', file.name);
        }}
      />
    </div>
  );
}