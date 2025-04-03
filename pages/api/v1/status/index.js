import database from '../../../../infra/database.js'

function status(req, res) {
  res
    .status(200)
    .json({ chave: "Alunos do curso.dev são acima da media" });
}

export default status;
