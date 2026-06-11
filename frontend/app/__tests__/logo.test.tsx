import { render, screen } from '@testing-library/react';
import Logo from '../components/layout/Logo';

test('logo', () => {
    render(<Logo />);
    const logo = screen.getByText(/Ayotomiwa Salau/i);
    expect(logo).not.toBeNull();
})