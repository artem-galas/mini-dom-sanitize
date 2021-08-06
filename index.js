const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const fs = require('fs');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const html = require('./sanitize.json').html_content;

function sanitizeTemplate(htmlContent) {
	const ADDITIONAL_ALLOWED_TAGS = ['link', 'meta', '#comment'];
	const ADDITIONAL_ALLOWED_ATTRIBUTES = [
		'http-equiv',
		'content',
		'type',
		'rel',
		'href',
		'xmlns:v',
		'xmlns:o',
		'target',
		'hspace',
		'vspace',
		'bicolor',
	];

	const DOCTYPE_TAG =
		'<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

	DOMPurify.addHook('afterSanitizeAttributes', (node) => {
		if (node.nodeName === 'HTML') {
			node.setAttribute('xmlns:v', 'urn:schemas-microsoft-com:vml');
			node.setAttribute('xmlns:o', 'urn:schemas-microsoft-com:office:office');
		}
	});

	const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
		WHOLE_DOCUMENT: true,
		ADD_TAGS: ADDITIONAL_ALLOWED_TAGS,
		ADD_ATTR: ADDITIONAL_ALLOWED_ATTRIBUTES,
		IN_PLACE: true,
		FORCE_BODY: true,
	});

	return `${DOCTYPE_TAG}${sanitizedHtml}`;
}


const cleanData = sanitizeTemplate(html);

const fileSize = Buffer.byteLength(cleanData) / 1024;

const used = process.memoryUsage().heapUsed / 1024 / 1024;

console.log(`File size is ${Math.round(fileSize * 100) / 100} kb`);
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
