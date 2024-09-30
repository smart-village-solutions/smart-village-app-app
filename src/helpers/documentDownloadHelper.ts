import { openShare } from './shareHelper';

const blobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject('Error while reading the blob');
    };

    reader.readAsDataURL(blob);
  });
};

const downloadPdf = async (url: string): Promise<Blob | undefined> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
  } catch (error) {
    console.error(error);
  }
};

interface DocumentData {
  url: string;
  title: string;
}

export const onDownloadAndSharePdf = async (documentData: DocumentData): Promise<void> => {
  const { url, title } = documentData;

  try {
    const blob = await downloadPdf(url);
    if (!blob) return;

    const base64Data = await blobToBase64(blob);
    if (!base64Data) return;

    await openShare({ title, url: base64Data as string });
  } catch (error) {
    console.error(error);
  }
};
