function status(req, res) {
  response
    .status(200)
    .json({ chave: "Alunos do curso.dev são acima da media" });
}

export default status;
