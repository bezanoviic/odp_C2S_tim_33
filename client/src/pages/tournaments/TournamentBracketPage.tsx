import { useParams } from "react-router-dom";

type BracketRound = {
  round: string;
  matches: Array<{ id: string; left: string; right: string; winner?: string }>;
};

const MOCK_BRACKET: BracketRound[] = [
  {
    round: "Semifinals",
    matches: [
      { id: "SF1", left: "Team Alpha", right: "Blue Tide", winner: "Team Alpha" },
      { id: "SF2", left: "Crimson Fox", right: "Team Nova", winner: "Team Nova" },
    ],
  },
  {
    round: "Final",
    matches: [{ id: "F1", left: "Team Alpha", right: "Team Nova" }],
  },
];

export default function TournamentBracketPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tournament bracket</h1>
        <p className="text-sm text-white/70">Tournament ID: {id}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_BRACKET.map((round) => (
          <section key={round.round} className="rounded-lg border border-white/10 p-4 bg-white/5">
            <h2 className="font-semibold text-white mb-3">{round.round}</h2>
            <ul className="space-y-2 text-sm text-white/80">
              {round.matches.map((match) => (
                <li key={match.id} className="rounded border border-white/10 p-3">
                  <div>{match.left} vs {match.right}</div>
                  <div className="text-white/60">Winner: {match.winner ?? "TBD"}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}