// import { Controller, Post, UploadedFile, Request } from '@nestjs/common';

// @Controller('upload')
// export class UploadController {
//   @Post('file')
//   uploadFile = (req: Request, @UploadedFile() file: Express.Multer.File) => {
//     console.log(file); // Handle the uploaded file
//     return {
//       message: 'File uploaded successfully',
//       filePath: file.path, // Path to the uploaded file
//     };
//   };
// }


import { Controller, Post, UploadedFile, Request } from '@nestjs/common';

@Controller('upload')
export class UploadController {
  @Post('file')
  uploadFile(@Request() req: Request, @UploadedFile() file: Express.Multer.File) {
    console.log(file); // Handle the uploaded file
    return {
      message: 'File uploaded successfully',
      filePath: file.path, // Path to the uploaded file
    };
  }
}
