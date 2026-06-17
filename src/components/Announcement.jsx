export default function Announcement() {
  return (
    <div className="bg-[#00ed64]/5 dark:bg-[#00ed64]/10 border border-[#00ed64]/10 dark:border-[#00ed64]/20 rounded-xl px-4 py-3 flex items-start space-x-3">
      <div className="w-2 h-2 bg-[#00ed64] rounded-full mt-1.5 flex-shrink-0 animate-badge-pulse"></div>
      <p className="text-xs text-slate-600 dark:text-[#a8b3bc] leading-relaxed">
        <span className="font-bold text-[#001e2b] dark:text-white">学习公告：</span>
        <br></br>
        词汇库已收录 120+ 上海中考核心词汇，涵盖名词、动词、形容词/副词、短语及词性转换五大模块。
        <br></br>
        P.S. 本项目由学生自行维护，如果对您有帮助，请务必大力支持
        <br></br>
        若有bug，欢迎反馈
        <br></br>
        <a href="mailto:yaoonion@gmail.com" target="_blank" rel="noopener noreferrer">邮箱</a>
        <br></br>
        QQ:2998963484
      </p>
    </div>
  );
}