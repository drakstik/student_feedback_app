'use strict';
import { Model } from "sequelize";
import argon2 from 'argon2';


/**
 * @typedef {Object} UserAttributes
 * @property {string} id
 * @property {string|null} username
 * @property {string} password
 * @property {string} phoneNumber
 * @property {'student'|'teacher'} role
 */

/**
 * This tells TypeScript which attributes are optional during .create()
 * @typedef {import('sequelize').Optional<UserAttributes, 'id'>} UserCreationAttributes
 */


/**
 * @extends {Model<UserAttributes, UserCreationAttributes>}
 */
export class User extends Model {

  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static associate(models) {
    // define association here
  }

  // Instance method to verify passwords during login
  async validPassword(loginPassword) {
    return await argon2.verify(this.password, loginPassword)
  }



  // Security Guard: Automatically strip password when turning model into JSON
  // We avoid stripping id, because it may be needed elsewhere. So when sending a 'User' json, make sure to just
  // send the specific fields you want.
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

export default (sequelize, DataTypes) => {
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
        set(val) {
          // Automatically stores usernames in lowercase in PostgreSQL
          this.setDataValue('username', val.toLowerCase().trim());
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      role: {
        type: DataTypes.ENUM('student', 'teacher'),
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'User',
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            // Argon2 handles the salt automatically
            user.password = await argon2.hash(user.password, {
              type: argon2.argon2id, // Hybrid mode: best of both worlds
              memoryCost: 2 ** 16,   // 64MB
              timeCost: 3,           // 3 iterations
              parallelism: 1
            });
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            // Argon2 handles the salt automatically
            user.password = await argon2.hash(user.password, {
              type: argon2.argon2id, // Hybrid mode: best of both worlds
              memoryCost: 2 ** 16,   // 64MB
              timeCost: 3,           // 3 iterations
              parallelism: 1
            });
          }
        }
      },
      // defaultScope belongs here, not inside 'options'
      defaultScope: {
        attributes: { exclude: ['password'] },
      }
    });
  return User;
};