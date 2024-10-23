//import mongoose from 'mongoose';


const getCodigo = async (model) => {
    const ultimoCodigo = await model.findOne().sort({ codigo: -1 });
    return ultimoCodigo ? ultimoCodigo.codigo + 1 : 1;
};

export default getCodigo;