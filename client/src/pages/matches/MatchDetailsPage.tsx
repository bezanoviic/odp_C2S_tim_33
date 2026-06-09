import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Team = {
  name: string;
  players: string[];
};

type MatchDetails = {
  id: string;
  status: "scheduled" | "live" | "finished";
  bestOf: number;
  teamA: Team;
  teamB: Team;
  score: { teamA: number; teamB: number };
};

const MOCK_MATCHES: Record<string, MatchDetails> = {
  "1": {
    id: "1",
    status: "finished",
    bestOf: 3,
    teamA: { name: "Team Alpha", players: ["AlphaOne", "AlphaTwo", "AlphaThree"] },
    teamB: { name: "Team Nova", players: ["NovaOne", "NovaTwo", "NovaThree"] },
    score: { teamA: 2, teamB: 1 },
  },
  "2": {
    id: "2",
    status: "live",
    bestOf: 3,
    teamA: { name: "Crimson Fox", players: ["FoxA", "FoxB", "FoxC"] },
    teamB: { name: "Blue Tide", players: ["TideA", "TideB", "TideC"] },
    score: { teamA: 1, teamB: 1 },
  },
};

export default function MatchDetailsPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, [id]);

  const match = useMemo(() => (id ? MOCK_MATCHES[id] : undefined), [id]);

  if (!id) {
    return <p className="text-sm text-white/70">Invalid match ID.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-white/70">Loading match details...</p>;
  }

  if (!match) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">Match not found</h1>
        <p className="text-sm text-white/70">No data for match #{id}. Try one of the watchlist links.</p>
        <Link className="underline text-sm" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">{match.teamA.name} vs {match.teamB.name}</h1>
        <p className="text-sm text-white/70">Match #{match.id} • BO{match.bestOf} • Status: {match.status}</p>
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <article className="rounded-lg border border-white/10 p-4 bg-white/5">
          <h2 className="font-semibold text-white mb-2">{match.teamA.name}</h2>
          <ul className="text-sm text-white/80 list-disc ml-5">
            {match.teamA.players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border border-white/10 p-4 bg-white/5">
          <h2 className="font-semibold text-white mb-2">{match.teamB.name}</h2>
          <ul className="text-sm text-white/80 list-disc ml-5">
            {match.teamB.players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-lg border border-white/10 p-4 bg-white/5">
        <h2 className="font-semibold text-white mb-2">Score</h2>
        <p className="text-lg text-white">{match.teamA.name} {match.score.teamA} : {match.score.teamB} {match.teamB.name}</p>
      </section>
    </div>
  );
}