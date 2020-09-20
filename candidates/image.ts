interface Size {
  width: number;
  height: number;
}

type DataUrl = string;
type SizeRestriction = Size;
type Image = HTMLImageElement;

export function fileToImage(file: File) {
  return readFileAsDataUrl(file).then(dataUrlToImage);
}

export function readFileAsDataUrl(file: File) {
  const reader = new FileReader();

  return new Promise<DataUrl>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataUrlToImage(dataUrl: DataUrl) {
  const img = new Image();

  return new Promise<Image>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function dataUrlToBlob(data: DataUrl) {
  return fetch(data).then(res => res.arrayBuffer());
  // const match = data.match(/^data:(\w+(?:\/\w+)?);base64,(.*)$/);

  // if (!match) {
  //   throw new Error(`Invalid DataURL: ${data}`);
  // }

  // const [_, mimetype, blob] = match;
  // const content = [];

  // for (let i = 0; i < blob.length; i++) {
  //   content[i] = blob.charCodeAt(i);
  // }

  // return new Blob([new Uint8Array(content)], { type: mimetype });
}

export function resizeFileIfRequired(
  limits: SizeRestriction,
  file: File,
): Promise<File> {
  return fileToImage(file).then(img => {
    if (!requiresResize(limits, img)) {
      return file;
    }

    const dataUrl = resize(limits, img);

    return dataUrlToBlob(dataUrl).then(
      blob => new File([blob], file.name, { type: file.type }),
    );
  });
}

function requiresResize(limits: SizeRestriction, img: Size) {
  return img.width > limits.width && img.height > limits.height;
}

function getCanvas(size: Size): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  (getCanvas as any) = ({ width, height }: Size) => {
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };

  return getCanvas(size);
}

function calculateSize(limits: SizeRestriction, img: Image) {
  const requiredWidthReduction = img.width / limits.width;
  const requiredHeightReduction = img.height / limits.height;
  const ratio = Math.max(requiredWidthReduction, requiredHeightReduction);
  const width = Math.round(img.width / ratio);
  const height = Math.round(img.height / ratio);
  return { width, height };
}

function resize(limits: SizeRestriction, img: Image): DataUrl {
  const size = calculateSize(limits, img);
  const canvas = getCanvas(size);

  const context = canvas.getContext('2d')!;
  context.drawImage(img, 0, 0, size.width, size.height);

  return canvas.toDataURL();
}
