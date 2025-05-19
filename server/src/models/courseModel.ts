import { DataTypes, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ==================== SEQUELIZE INITIALIZATION ====================
export const sequelize = new Sequelize({
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
enum ChapterType {
  Text = "Text",
  Quiz = "Quiz",
  Video = "Video",
}
enum CourseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}
enum CourseStatus {
  Draft = "Draft",
  Published = "Published",
}

// ==================== MODEL INTERFACES ====================
interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}

interface CommentAttributes {
  id: string;
  text: string;
  userId: string;
  chapterId: string;
}

interface ChapterAttributes {
  id: string;
  type: ChapterType;
  title: string;
  content: string;
  video?: string;
  sectionId: string;
}

interface SectionAttributes {
  id: string;
  title: string;
  description?: string;
  courseId: string;
}

interface CourseAttributes {
  id: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  price?: number;
  level: CourseLevel;
  status: CourseStatus;
  teacherId: string;
}

interface EnrollmentAttributes {
  userId: string;
  courseId: string;
  enrolledAt: Date;
}

// ==================== MODEL DEFINITIONS ====================
export class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: string;

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  generateAuthToken(): string {
    return jwt.sign({ id: this.id, role: this.role }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  }
}

export class Comment extends Model<CommentAttributes> implements CommentAttributes {
  declare id: string;
  declare text: string;
  declare userId: string;
  declare chapterId: string;
}

export class Chapter extends Model<ChapterAttributes> implements ChapterAttributes {
  declare id: string;
  declare type: ChapterType;
  declare title: string;
  declare content: string;
  declare video?: string;
  declare sectionId: string;
}

export class Section extends Model<SectionAttributes> implements SectionAttributes {
  declare id: string;
  declare title: string;
  declare description?: string;
  declare courseId: string;
}

export class Course extends Model<CourseAttributes> implements CourseAttributes {
  declare id: string;
  declare title: string;
  declare description?: string;
  declare category: string;
  declare image?: string;
  declare price?: number;
  declare level: CourseLevel;
  declare status: CourseStatus;
  declare teacherId: string;
}

export class Enrollment extends Model<EnrollmentAttributes> implements EnrollmentAttributes {
  declare userId: string;
  declare courseId: string;
  declare enrolledAt: Date;
}

// ==================== MODEL INITIALIZATION ====================
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "student",
    },
  },
  {
    sequelize,
    modelName: "user",
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "comment",
    tableName: "comments",
  }
);

Chapter.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ChapterType)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    video: {
      type: DataTypes.STRING,
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "chapter",
    tableName: "chapters",
  }
);

Section.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "section",
    tableName: "sections",
  }
);

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    level: {
      type: DataTypes.ENUM(...Object.values(CourseLevel)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CourseStatus)),
      allowNull: false,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "course",
    tableName: "courses",
  }
);

Enrollment.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    enrolledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "enrollment",
    tableName: "enrollments",
  }
);

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
export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    if (process.env.NODE_ENV === "development") {
      // Hapus sync dengan force: true
      await sequelize.sync({ alter: true }); // Gunakan alter sebagai gantinya
      console.log("Database synchronized");
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};
