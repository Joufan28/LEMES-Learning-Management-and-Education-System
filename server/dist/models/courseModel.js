"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.Enrollment = exports.Course = exports.Section = exports.Chapter = exports.Comment = exports.User = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ==================== SEQUELIZE INITIALIZATION ====================
exports.sequelize = new sequelize_1.Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
    },
});
// ==================== ENUMS ====================
var ChapterType;
(function (ChapterType) {
    ChapterType["Text"] = "Text";
    ChapterType["Quiz"] = "Quiz";
    ChapterType["Video"] = "Video";
})(ChapterType || (ChapterType = {}));
var CourseLevel;
(function (CourseLevel) {
    CourseLevel["Beginner"] = "Beginner";
    CourseLevel["Intermediate"] = "Intermediate";
    CourseLevel["Advanced"] = "Advanced";
})(CourseLevel || (CourseLevel = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["Draft"] = "Draft";
    CourseStatus["Published"] = "Published";
})(CourseStatus || (CourseStatus = {}));
// ==================== MODEL DEFINITIONS ====================
class User extends sequelize_1.Model {
    comparePassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(password, this.password);
        });
    }
    generateAuthToken() {
        return jsonwebtoken_1.default.sign({ id: this.id, role: this.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    }
}
exports.User = User;
class Comment extends sequelize_1.Model {
}
exports.Comment = Comment;
class Chapter extends sequelize_1.Model {
}
exports.Chapter = Chapter;
class Section extends sequelize_1.Model {
}
exports.Section = Section;
class Course extends sequelize_1.Model {
}
exports.Course = Course;
class Enrollment extends sequelize_1.Model {
}
exports.Enrollment = Enrollment;
// ==================== MODEL INITIALIZATION ====================
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "student",
    },
}, {
    sequelize: exports.sequelize,
    modelName: "user",
    tableName: "users",
    hooks: {
        beforeCreate: (user) => __awaiter(void 0, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            user.password = yield bcrypt_1.default.hash(user.password, salt);
        }),
    },
});
Comment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    chapterId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: exports.sequelize,
    modelName: "comment",
    tableName: "comments",
});
Chapter.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(ChapterType)),
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    video: {
        type: sequelize_1.DataTypes.STRING,
    },
    sectionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: exports.sequelize,
    modelName: "chapter",
    tableName: "chapters",
});
Section.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: exports.sequelize,
    modelName: "section",
    tableName: "sections",
});
Course.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
    },
    level: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(CourseLevel)),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(CourseStatus)),
        allowNull: false,
    },
    teacherId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: exports.sequelize,
    modelName: "course",
    tableName: "courses",
});
Enrollment.init({
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    enrolledAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: exports.sequelize,
    modelName: "enrollment",
    tableName: "enrollments",
});
// ==================== MODEL ASSOCIATIONS ====================
// User associations
User.hasMany(Course, {
    foreignKey: "teacherId",
    as: "coursesTaught",
    onDelete: "CASCADE",
});
User.belongsToMany(Course, {
    through: "enrollments",
    foreignKey: "userId",
    otherKey: "courseId",
    as: "enrolledCourses",
});
// Course associations
Course.belongsTo(User, {
    foreignKey: "teacherId",
    as: "teacher",
});
Course.hasMany(Section, {
    foreignKey: "courseId",
    as: "sections",
    onDelete: "CASCADE",
});
Course.belongsToMany(User, {
    through: "enrollments",
    foreignKey: "courseId",
    otherKey: "userId",
    as: "enrolledStudents",
});
// Section associations
Section.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
});
Section.hasMany(Chapter, {
    foreignKey: "sectionId",
    as: "chapters",
    onDelete: "CASCADE",
});
// Chapter associations
Chapter.belongsTo(Section, {
    foreignKey: "sectionId",
    as: "section",
});
Chapter.hasMany(Comment, {
    foreignKey: "chapterId",
    as: "comments",
    onDelete: "CASCADE",
});
// Comment associations
Comment.belongsTo(Chapter, {
    foreignKey: "chapterId",
    as: "chapter",
});
Comment.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});
// ==================== DATABASE INITIALIZATION ====================
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.sequelize.authenticate();
        console.log("Database connected");
        if (process.env.NODE_ENV === "development") {
            // Hapus sync dengan force: true
            yield exports.sequelize.sync({ alter: true }); // Gunakan alter sebagai gantinya
            console.log("Database synchronized");
        }
    }
    catch (error) {
        console.error("Database initialization failed:", error);
        throw error;
    }
});
exports.initializeDatabase = initializeDatabase;
