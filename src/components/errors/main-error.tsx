export function MainError() {
  return (
    <div role="alert">
      <h2>Ops, algo deu errado.</h2>
      <button type="button" onClick={() => window.location.assign('/')}>
        Recarregar
      </button>
    </div>
  )
}
