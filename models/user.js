const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,'Username cannot be blank']
    },
    password:{
        type:String,
        required:[true,'Password cannot be blank']
    },
})

userSchema.statics.findAndValidate = async function(username,password){
    const foundUser =await this.findOne({username});
  
    const isValidate = await bcrypt.compare(password,foundUser.password);
    return isValidate ? foundUser : false;
} 
//用pre中间件，在save之前运行一些函数，
userSchema.pre('save',async function(next){
    //如果密码没有被修改，就进入下一步，这里next就是是save
   if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12);
    next();
})

module.exports = mongoose.model('User', userSchema);