"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
const user_repository_1 = require("../repositories/user.repository");
const userRepo = new user_repository_1.UserRepository();
async function listUsers(req, res, next) {
    try {
        const skip = Number(req.query.skip) || 0;
        const limit = Number(req.query.limit) || 100;
        const users = await userRepo.listAll(skip, limit);
        res.status(200).json({
            success: true,
            data: users,
            message: "Users list retrieved successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
