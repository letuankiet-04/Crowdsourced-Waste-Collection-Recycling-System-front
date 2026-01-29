export default function TopRank() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-bold text-gray-900 text-xl">Top rank</h4>
        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">Month</span>
      </div>
      <div className="flex items-center justify-center py-12">
        <span className="text-sm font-medium text-gray-500">Wait API</span>
      </div>

      <button className="w-full mt-8 py-3.5 text-base text-gray-500 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 active:scale-[0.98]">
        View leaderboard
      </button>
    </div>
  );
}
