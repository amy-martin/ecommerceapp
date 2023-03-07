const { pool } = require('../db/server.js');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// REGISTRATION HELPERS
// ____________________

// Password Hashing Function
const passwordHash = async (password, saltRounds) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash
    } catch (err) {
        console.log(err);
    }
    return null;
};

// Function to check if user already exists
const findUser = async (email, cb) => {
    try {
        const SQL = 'SELECT * FROM users WHERE email=$1';
        const foundUser = await pool.query(SQL, [email])
        if (cb) {
            cb(null, foundUser.rows[0]);
        }
        return foundUser
    } catch (err) {
        console.log(err)
        if (cb) {
            cb(err, null);
        }
        
    }
};

// Function to check if username is already taken
const findUsername = async (username, cb) => {
    try {
        const SQL = 'SELECT * FROM users WHERE username=$1';
        const foundUser = await pool.query(SQL, [username])
        if (cb) {
            cb(null, foundUser.rows[0]);
        }
        return foundUser;
    } catch (err) {
        console.log(err);
        if (cb) {
            cb(err, null);
        }
    }
};

// Registration function to create user in database
const createUser = async (username, password, first_name, last_name, telephone, email) => {
    const hashedPassword = await passwordHash(password, 10);
    const SQL = 'INSERT INTO users (username, password, first_name, last_name, telephone, email) VALUES ($1, $2, $3, $4, $5, $6)';

    pool.query(SQL, [username, hashedPassword, first_name, last_name, telephone, email], (error, results) => {
        if (error) {
            throw error
        }
    })
}

// Callback function for register route that will register user and return success result
const registerUser = async (req, res) => {
    const {username, password, first_name, last_name, telephone, email} = req.query;
    try {
        // DATA VALIDATION AND FORMATTING
        if (!validator.isLength(username, {min: 2, max:20})) {
            if (username.length < 2) {
                res.send('USERNAME TOO SHORT')
            }
            if (username.length > 20) {
                res.send('USERNAME TOO LONG')
            }
            return
        }
        // PASSWORD STRENGTH; REFER TO DOCUMENTATION WHEN CREATED FRONT END PROMPT
        // if (!validator.isStrongPassword(password)) {
        //     res.send('PASSWORD NOT STRONG ENOUGH');
        // }

        if (!validator.isLength(first_name, {min: 2, max:20})) {
            if (first_name.length < 2) {
                res.send('FIRST NAME TOO SHORT')
            }
            if (first_name.length > 20) {
                res.send('FIRST NAME TOO LONG')
            }
            return
        }
        if (!validator.isLength(last_name, {min: 2, max:20})) {
            if (last_name.length < 2) {
                res.send('LAST NAME TOO SHORT')
            }
            if (last_name.length > 20) {
                res.send('LAST NAME TOO LONG')
            }
            return
        }
        // if (!validator.isMobilePhone(telephone)) {
        //     res.send('INVALID PHONE NUMBER');
        //     return
        // }
        if (!validator.isEmail(email)) {
            res.send('INVALID EMAIL');
            return
        }
        const formattedEmail = validator.normalizeEmail(email);

        // CHECK IF USER EXISTS IN DATABASE
        const userFound = await findUser(formattedEmail);
        if (userFound.rows.length !== 0) {
            res.send('USER ALREADY EXISTS')
            return 
            // return res.reditect("login");
        };
        //CHECK IF USERNAME IS ALREADY TAKEN
        const usernameFound = await findUsername(username);
        if (usernameFound.rows.length !== 0) {
            res.send('USERNAME TAKEN')
            return
        } 
        await createUser(username, password, first_name, last_name, telephone, formattedEmail);
        const createdUser = await findUser(formattedEmail);
        res.send(`USER CREATED WITH ID: ${createdUser.rows[0].id}`)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
    
}



// LOGIN HELPERS
// _____________

// Passport Local Strategy to Authenticate Users

const localStrategy = new LocalStrategy((username, password, done) => {
    const hashedPassword = passwordHash(password)
    findUsername(username, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        if (user.password) {

        }
    })
})





module.exports = { registerUser, localStrategy }