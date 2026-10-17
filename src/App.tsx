import EditorJSONVisual from "./EditorJSONVisual";

export default function App(): JSX.Element {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Editor JSON Visual</h1>
        <p>Edição de JSON com validação de schema JSON</p>
      </header>
      <EditorJSONVisual />
    </div>
  );
}
