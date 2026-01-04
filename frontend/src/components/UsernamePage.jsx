export default function UsernamePage({ onSubmit, loading }) {
  let input = "";

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Enter Username
        </h2>

        <input
          className="w-full border px-3 py-2 mb-4"
          placeholder="Your username"
          onChange={(e) => (input = e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white py-2"
          onClick={() => onSubmit(input)}
          disabled={loading}
        >
          {loading ? "Joining..." : "Join"}
        </button>
      </div>
    </div>
  );
}
