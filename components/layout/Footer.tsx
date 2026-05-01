const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Financial Disclosure",
  "Contact Support",
];

export function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
        <div className="flex flex-col items-center gap-2 lg:items-start">
          <div className="text-lg font-semibold text-slate-800">Axiro Capital</div>
          <p className="text-center text-xs tracking-wide text-slate-500 lg:text-left">
            {`© ${new Date().getFullYear()} Axiro Capital. Empowering MSMEs through precision advisory.`}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {footerLinks.map((link) => (
            <a
              key={link}
              className="text-xs tracking-wide text-slate-500 transition-colors duration-200 hover:text-emerald-600 hover:underline underline-offset-4"
              href="#"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
