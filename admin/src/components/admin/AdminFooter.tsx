export default function AdminFooter() {
  return (
    <footer className="border-t border-gray-200 px-6 py-4 bg-white">
      <p className="text-center text-[0.8rem] font-bold text-gray-400">
        Cocospice Admin &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
