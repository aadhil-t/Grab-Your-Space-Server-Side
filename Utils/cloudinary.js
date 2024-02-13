const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name:"dgyyxrdwa" ,
    api_key:192426352318771,
    api_secret:"9XG8AJVANXSIyLuLUFkOlc6sgqI",
    secure:true,
});
const uploadToCloudinary = async (path,folder)=>{
try {
    const data = await cloudinary.v2.uploader.upload(path,{folder});
    return {url: data.url,public_id: data.public_id} 
} catch (error) {
    console.log(error.message);
}
}

const MultiUploadCloudinary = async( files, folder)=>{
    try {
        const uploadImg = [];
        for (const file of files){
            const {path} = file;
            const result = await uploadToCloudinary(path , folder);

            if(result.url){
                uploadImg.push(result.url);
            }
        }
        return uploadImg
    } catch (error) {
        console.log(error)
    }
}

module.exports ={
    uploadToCloudinary,
    MultiUploadCloudinary,
}