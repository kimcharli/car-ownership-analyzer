import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ConfigPanel from './ConfigPanel';

describe('ConfigPanel Component', () => {
    const mockSetParams = vi.fn();
    const defaultParams = {
        newCarPrice: 38000,
        years: 40
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock URL.createObjectURL and URL.revokeObjectURL
        global.URL.createObjectURL = vi.fn(() => 'mock-url');
        global.URL.revokeObjectURL = vi.fn();
        // Mock alert
        global.alert = vi.fn();
        // Spy on click
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders Export and Import buttons', () => {
        render(<ConfigPanel params={defaultParams} setParams={mockSetParams} />);

        expect(screen.getByText('Export')).toBeInTheDocument();
        expect(screen.getByText('Import')).toBeInTheDocument();
    });

    it('triggers export logic when Export button is clicked and generates correct data', async () => {
        const createdBlobs = [];
        global.URL.createObjectURL = vi.fn((blob) => {
            createdBlobs.push(blob);
            return 'mock-url';
        });

        render(<ConfigPanel params={defaultParams} setParams={mockSetParams} />);

        const exportBtn = screen.getByText('Export');
        await userEvent.click(exportBtn);

        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();

        // Verify the content of the exported file
        expect(createdBlobs).toHaveLength(1);
        const blob = createdBlobs[0];

        // Use FileReader to read the blob since blob.text() might not be available in JSDOM
        const reader = new FileReader();
        const readPromise = new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
        });
        reader.readAsText(blob);
        const text = await readPromise;

        const exportedData = JSON.parse(text);

        expect(exportedData).toEqual(defaultParams);
    });

    it('updates params when a valid JSON file is imported', async () => {
        render(<ConfigPanel params={defaultParams} setParams={mockSetParams} />);

        const file = new File([JSON.stringify({ newCarPrice: 50000, years: 40 })], 'config.json', { type: 'application/json' });
        const input = screen.getByLabelText('Import');

        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(mockSetParams).toHaveBeenCalled();
            // Verify correct update function behavior
            // Access call args via .mock.calls
            const calls = mockSetParams.mock.calls;
            if (calls.length > 0) {
                const updateFn = calls[0][0];
                const result = updateFn({}); // Simulate previous state
                expect(result.newCarPrice).toBe(50000);
            }
        });
    });

    it('shows alert when importing invalid JSON', async () => {
        render(<ConfigPanel params={defaultParams} setParams={mockSetParams} />);

        // Missing required keys (years)
        const file = new File([JSON.stringify({ foo: 'bar' })], 'invalid.json', { type: 'application/json' });
        const input = screen.getByLabelText('Import');

        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Invalid configuration file'));
            expect(mockSetParams).not.toHaveBeenCalled();
        });
    });

    it('shows alert when importing malformed JSON', async () => {
        render(<ConfigPanel params={defaultParams} setParams={mockSetParams} />);

        const file = new File(['{ invalid json }'], 'bad.json', { type: 'application/json' });
        const input = screen.getByLabelText('Import');

        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to parse configuration file'));
            expect(mockSetParams).not.toHaveBeenCalled();
        });
    });
});
