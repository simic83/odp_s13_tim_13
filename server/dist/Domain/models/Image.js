"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = exports.Category = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Collection_1 = require("./Collection");
const Comment_1 = require("./Comment");
const Like_1 = require("./Like");
var Category;
(function (Category) {
    Category["INTERIOR"] = "interior";
    Category["FASHION"] = "fashion";
    Category["RECIPES"] = "recipes";
    Category["TRAVEL"] = "travel";
    Category["ART"] = "art";
    Category["NATURE"] = "nature";
    Category["TECHNOLOGY"] = "technology";
    Category["FITNESS"] = "fitness";
    Category["DIY"] = "diy";
    Category["PHOTOGRAPHY"] = "photography";
})(Category || (exports.Category = Category = {}));
let Image = class Image {
};
exports.Image = Image;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Image.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Image.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Image.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Image.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Image.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Category
    }),
    __metadata("design:type", String)
], Image.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Image.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Image.prototype, "saves", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Image.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Image.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Image.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.images, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], Image.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Image.prototype, "collectionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Collection_1.Collection, collection => collection.images, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'collectionId' }),
    __metadata("design:type", Collection_1.Collection)
], Image.prototype, "collection", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment_1.Comment, comment => comment.image),
    __metadata("design:type", Array)
], Image.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Like_1.Like, like => like.image),
    __metadata("design:type", Array)
], Image.prototype, "likeRecords", void 0);
exports.Image = Image = __decorate([
    (0, typeorm_1.Entity)('images')
], Image);
