type Props = {
    number: string;
    label: string;
    highlight?: boolean;
  };
  
  export default function StatCard({ number, label, highlight }: Props) {
    return (
      <div
        className={`
          p-8
          rounded-xl
          border border-white/10
          ${highlight ? "bg-white/5" : "bg-transparent"}
        `}
      >
        <p className="font-mono text-4xl">{number}</p>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          {label}
        </p>
      </div>
    );
  }
  