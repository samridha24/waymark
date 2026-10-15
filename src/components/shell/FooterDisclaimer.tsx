export default function FooterDisclaimer() {
  return (
    <footer
      className="w-full mt-24 py-8 text-center"
      style={{ borderTop: '1px solid var(--rule)' }}
    >
      <div className="max-w-reading mx-auto px-6 space-y-2">
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
        >
          <strong>Educational simulation only.</strong> Not personalised investment advice. No
          financial transactions occur. All projections are hypothetical illustrations based on
          editable assumptions — not forecasts, guarantees, or personalised recommendations. Actual
          returns, fees, taxes, and conditions differ by product and individual circumstances.
          Consult a registered financial advisor before making investment decisions.
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
          Data stored on this device only. No account, no real money, no bank connection.
        </p>
      </div>
    </footer>
  );
}
