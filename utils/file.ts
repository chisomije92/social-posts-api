import fs from "fs";
import path from "path";

export const clearImage = (imagePath: string) => {
  imagePath = path.join(__dirname, "../", imagePath);
  fs.unlink(imagePath, (err) => console.log(err));
};
