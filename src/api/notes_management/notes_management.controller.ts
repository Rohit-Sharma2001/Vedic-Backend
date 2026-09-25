// notes_management.controller.ts
import { Controller, Get, Post, Body, Request, Put, Param, UseInterceptors } from '@nestjs/common';
import { NotesManagementService } from './notes_management.services';
import { Notes } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('notes_management')
@UseInterceptors(Base64Interceptor)
export class NotesManagementController {
    constructor(private readonly notesManagementService: NotesManagementService) { }

    @Post('add')
    async create(@Request() req: Request, @Body('data') data: string) {
        try {
            console.log('Request Body:', req.body);
            console.log('Encrypted Data Received:', data);

            if (!data) {
                throw new Error('Encrypted data is missing');
            }

            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const notes: Partial<Notes> = JSON.parse(decodedData);

            console.log('Decoded Notes:', notes);

            const createdNote = await this.notesManagementService.create(notes);

            return {
                message: 'Note successfully added!',
                statusCode: 201,
                data: createdNote
            };
        } catch (error) {
            console.error('Error decoding or parsing encrypted data:', error);
            return {
                message: 'Invalid encrypted data format or server error.',
                statusCode: 400,
                error: error.message
            };
        }
    }

    @Post('delete')
    async delete(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const note: Partial<Notes> = JSON.parse(decodedData);
            const id = note['id'];

            console.log(`Deleting note with id: ${id}`);

            if (!Types.ObjectId.isValid(id)) {
                return {
                    message: 'Invalid ObjectId format',
                    statusCode: 400,
                };
            }

            return this.notesManagementService.deleteNote(id);

        } catch (error) {
            console.error('Error deleting note:', error);
            return {
                message: 'An error occurred while deleting the note',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('allNotes')
    async findAllNotes(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const notesData: Partial<Notes> = JSON.parse(decodedData);
            console.log(notesData, "notesData");

            const page = notesData['page'] || 1;
            const pageSize = notesData['pageSize'] || 10;

            return this.notesManagementService.findAllNotes(page, pageSize);

        } catch (error) {
            console.error('Error fetching notes:', error);
            return {
                message: 'An error occurred while fetching the notes',
                statusCode: 500,
                error: error.message,
            };
        }
    }
}
