import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ) { }

    async create(createDto: CreateEventDto): Promise<Event> {
        // 1) 같은 name의 이벤트가 이미 있는지 체크
        const exists = await this.eventModel.findOne({
            name: createDto.name,
        }).exec();
        if (exists) {
            throw new ConflictException('이미 동일한 이름의 이벤트가 존재합니다.');
        }

        // 2) create 진행
        const created = new this.eventModel({
            ...createDto,
            startDate: new Date(createDto.startDate),
            endDate: new Date(createDto.endDate),
        });
        return created.save();
    }

    async findAll(): Promise<Event[]> {
        return this.eventModel.find().exec();
    }

    async findOne(id: string): Promise<Event> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
        const evt = await this.eventModel.findById(id).exec();
        if (!evt) throw new NotFoundException('Event not found');
        return evt;
    }

    async update(id: string, updateDto: UpdateEventDto): Promise<Event> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
        const updated = await this.eventModel
            .findByIdAndUpdate(
                id,
                {
                    ...updateDto,
                    ...(updateDto.startDate && { startDate: new Date(updateDto.startDate) }),
                    ...(updateDto.endDate && { endDate: new Date(updateDto.endDate) }),
                },
                { new: true },
            )
            .exec();
        if (!updated) throw new NotFoundException('Event not found');
        return updated;
    }

    async remove(id: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
        const res = await this.eventModel.findByIdAndDelete(id).exec();
        if (!res) throw new NotFoundException('Event not found');
    }
}
