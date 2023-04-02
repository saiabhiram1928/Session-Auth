const crypto  =require('node:crypto');

const hashPasswd= (passwd) =>{
    const salt = crypto.randomBytes(64).toString('hex');
    const hash  = crypto.pbkdf2Sync(passwd ,salt, 100000 , 64 , 'sha512').toString('hex')
    return { 
        salt,
        hash
    }  
}

const verifyPasswd = (passwd , hash ,salt) =>{
    const verifyHash = crypto.pbkdf2Sync(passwd ,salt , 100000 ,64, 'sha512').toString('hex')
    return verifyHash===hash
}
module.exports.hashPasswd = hashPasswd
module.exports.verifyPasswd = verifyPasswd