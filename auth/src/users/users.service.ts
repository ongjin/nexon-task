import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async create(email: string, password: string): Promise<UserDocument> {
        // saltRounds는 env로 관리 나중에
        const hashed = await bcrypt.hash(password, 10);
        try {
            const created = new this.userModel({ email, password: hashed });
            return created.save();
        } catch (err) {
            throw new ConflictException('이미 존재하는 이메일입니다.');
        }
    }

    async validateUser(email: string, pass: string): Promise<UserDocument | null> {
        const user = await this.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            return user;
        }
        return null;
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    /** 전체 유저 조회 */
    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().exec();
    }

    /** 특정 유저의 roles 업데이트 */
    async updateRoles(id: string, roles: string[]): Promise<UserDocument> {
        const user = await this.userModel
            .findByIdAndUpdate(id, { roles }, { new: true })
            .exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
