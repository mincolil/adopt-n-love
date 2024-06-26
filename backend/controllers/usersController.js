const User = require('../models/User')
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt')

// route '/user'
// GET
const getAll = async (req, res) => {
    try {
        const { fullname, email, role, status, sort } = req.query;
        const query = {};

        if (fullname) {
            query.fullname = { $regex: new RegExp(fullname, 'i') };
        }
        if (email) {
            query.email = { $regex: new RegExp(email, 'i') };
        }
        if (role) {
            query.role = role;
        }

        const result = await User.find(query); // Modified to use find instead of paginate

        if (!result || result.length === 0) {
            return res.status(404).json({
                error: "There are no Users in the Database",
            });
        }
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

// route '/user'
// POST
const createUser = async (req, res) => {
    try {
        const { fullname, email, password, role, phone, address, gender, status, userImage } = req.body

        const [duplicateEmail, duplicatePhoneNumber] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ phone })
        ])
        console.log(phone)
        console.log(duplicatePhoneNumber)
        // check duplicate phonenumber
        if (duplicatePhoneNumber !== null) {
            res.status(400).json({ error: "Số điện thoại này đã được sử dụng" })
            return;
        }

        // check duplicate email
        if (duplicateEmail) {
            res.status(400).json({ error: "Email này đã được sử dụng" })
            return;
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ fullname, email, "password": hashPassword, role, phone, address, gender, status, userImage })
        if (!user) {
            res.status(500).json({
                error: "Server error! Please try again"
            })
        } else {
            res.status(201).json({
                message: "Create successful",
                User: user,
            })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

// route '/user'
// PATCH
const updateUser = async (req, res) => {
    try {
        const { fullname, email, role, phone, address, gender, status, userImage } = req.body
        // console.log(req.body)
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(404).json({
                error: "User not found"
            })
        }
        user.fullname = fullname
        user.role = role
        user.phone = phone
        user.address = address
        user.gender = gender
        user.status = status
        user.userImage = userImage

        if (phone) { // nếu như có nhập sđt
            const [userFindByEmail, userFindByPhone] = await Promise.all([
                User.findOne({ email }),
                User.findOne({ phone })
            ]);
            console.log(userFindByPhone)
            if (userFindByPhone !== null) { // nếu như số điện thoại này đã có người sử dụng
                if (userFindByEmail.email === userFindByPhone.email) {
                    console.log(userFindByEmail.email, " | ", userFindByPhone.email)
                    console.log("ok"); // ok sđt của cùng 1 ng
                } else {
                    res.status(400).json({ error: "Số điện thoại này đã có người sử dụng!" })
                    return;
                }
            } else {
                console.log("ok") // ok so này chưa có ai dùng
            }
        }

        // update user
        const result = await user.save()
        if (result) {
            res.status(201).json({
                message: `Updated ${user.fullname}`
            })
        } else {
            res.status(400).json({
                error: "Update fail"
            })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}
// route '/user/search'
// Get
const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await User.findById(id)
        if (!result) return res.json({
            error: "No user found"
        })
        res.status(200).json(result)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}
// route '/user'
// DELETE
const deleteOne = async (req, res) => {
    const { id } = req.params
    try {
        await User.findByIdAndDelete(id)
        res.status(201).json({
            message: `Deleted user ${id}`
        })
    } catch (err) {
        console.log(err)
        res.status(400)
    }
}
module.exports = {
    getAll,
    createUser,
    updateUser,
    deleteOne,

    getUserById
}


