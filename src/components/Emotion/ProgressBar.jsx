
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-[500px] h-3 bg-[#f0f2f5] rounded-full overflow-hidden flex items-center px-1">
      <div
        className="h-[10px] bg-black rounded-full shadow-[0_10px_40px_-10px_white] transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;