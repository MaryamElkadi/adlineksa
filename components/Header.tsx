import Link from 'next/link';
import React from 'react';
import { Button } from './Button';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-brand-dark bg-opacity-90 backdrop-blur-md border-b border-brand-dark/30">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-semibold text-brand-yellow">Adline KSA</div>
        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a className="text-brand-yellow hover:text-brand-yellow/80 transition-colors">
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        <Button variant="primary" className="ml-4 hidden md:inline-block">
          Get Started
        </Button>
      </nav>
    </header>
  );
};
