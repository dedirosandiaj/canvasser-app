import 'dotenv/config';

console.log('Testing dotenv loading...');
if (process.env.GOOGLE_SHEET_ID === '1JLixX-qWsz8dNrEml-LP1JUq_oj0XtTBMikGe5L16ls') {
    console.log('SUCCESS: .env loaded correctly.');
} else {
    console.error('FAILURE: GOOGLE_SHEET_ID not found or incorrect.', process.env.GOOGLE_SHEET_ID);
}
