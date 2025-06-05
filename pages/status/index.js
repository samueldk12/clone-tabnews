import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);

  return await response.json();
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DataStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 1000,
    dedupingInterval: 1000,
  });

  let updatedText = "Carregando...";

  if (!isLoading && data) {
    updatedText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Ultima atualização: {updatedText}</div>;
}

function DataStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 1000,
    dedupingInterval: 1000,
  });

  if (isLoading) {
    return (
      <>
        <h2>Database</h2>
        <p>Carregando...</p>
      </>
    );
  }

  return (
    <>
      <h2>Database</h2>
      <div>Versão: {data.dependencies.database.version}</div>
      <div>
        Conexões Abertas: {data.dependencies.database.opened_connections}
      </div>
      <div>Conexões Máximas: {data.dependencies.database.max_connections}</div>
    </>
  );
}
