type QuestionOption = { ref: string; label: string; position: number };

export function QuestionForm({ questionRef, options, action, error, pending = false }: { questionRef: string; options: QuestionOption[]; action: (formData: FormData) => void; error?: string; pending?: boolean }) {
  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="questionRef" value={questionRef} />
      <fieldset aria-describedby={error ? "option-error" : undefined}>
        <legend>Selecciona una opción</legend>
        {options.map((option) => <label className="option-row" key={option.ref}><input type="radio" name="optionRef" value={option.ref} /> <span>{option.label}</span></label>)}
      </fieldset>
      {error ? <p id="option-error" role="alert" className="form-error">{error}</p> : null}
      <button type="submit" className="primary-action" disabled={pending}>{pending ? "Comprobando…" : "Responder"}</button>
    </form>
  );
}
