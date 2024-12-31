const mongoose=require("mongoose")

mongoose.connect("mongodb+srv://admin:admin%4013@dental.9jmol.mongodb.net/dental?retryWrites=true&w=majority")
    .then(() => {
        console.log('mongoose connected');
    })
    .catch((e) => {
        console.log('failed to connect to MongoDB:', e);
    });



    const logInSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true, // Make sure it's required
            unique: true // Optional: to ensure unique email addresses
        },
        password: {
            type: String,
            required: true
        }
    });
    const pdfSchema = new mongoose.Schema({
        filename: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now },
        description: { type: String, required: false }, // Optional: You can add a description field
    });
    
const LogInCollection=new mongoose.model('LogInCollection',logInSchema)
const Pdf = mongoose.model('Pdf', pdfSchema);

module.exports = Pdf;
module.exports=LogInCollection