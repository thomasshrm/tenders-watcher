export default function SecFilingsPanel(props: { query?: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">SEC Filings</h3>
      <p className="text-sm text-neutral-400">
        Coming soon… {props.query ? `(query: ${props.query})` : null}
      </p>
    </div>
  );
}
