const ImageFactory = {
	DEFAULT_TEXT_PROPERTIES : {
		font : '10px sans-serif',
		textColor: 'black',
		backgroundColor: '#00000000',
		borderColor : '#00000000',
		horAlignment: 'middle',
		verAlignment: 'middle',
		borderX: 0.1,
		borderY: 0.1,
		marginX: 0.1,
		marginY: 0.1,
		resize: true
	},
	determineFontHeight : function(fontStyle) {
		var body = document.getElementsByTagName("body")[0];
		var dummy = document.createElement("div");
		var dummyText = document.createTextNode("M");
		dummy.appendChild(dummyText);
		dummy.setAttribute("style", fontStyle);
		body.appendChild(dummy);
		var result = dummy.offsetHeight;
		body.removeChild(dummy);
		return result;
	},
	multiplyFontSize : function(context, factor) {
		const font = context.font;
		const indexRight = font.indexOf('px');
		const indexLeft = font.lastIndexOf(' ', indexRight);
		let size = parseInt(font.substring(indexLeft + 1, indexRight));
		size *= factor;
		context.font = font.substring(0, indexLeft) + ' ' + Math.round(size) + 'px' + font.substring(indexRight + 2);
	},
	ASSENT_FACTOR : 0.8,
	createTextImage : function(text, props, width, height){
		this.completeTextProperties(props);
		const canvas = document.createElement('canvas');
		let context;
		if(width === undefined || height === undefined){
			canvas.width = 512;
			canvas.height = 128;
			width = 512;
			height = 128;
			context = canvas.getContext('2d');
			if(props.resize){
				context.font = props.font;
				let boundWidth = context.measureText(text).width;
				let boundHeight = ImageFactory.determineFontHeight('font: ' + props.font + ';');
				if(boundWidth !== 0 && boundHeight !== 0){
					const whFactor = boundWidth / boundHeight;
					canvas.width = Math.round(canvas.height * whFactor);
					context = canvas.getContext('2d');
					width = canvas.width;
					height = canvas.height;
				}
			}
		}
		else {
			canvas.width = width;
			canvas.height = height;
			context = canvas.getContext('2d');
		}
		const minBX = Math.round(width * props.borderX);
		const minBY = Math.round(height * props.borderY);
		const maxBX = Math.round((1 - props.borderX) * width);
		const maxBY = Math.round((1 - props.borderY) * height);
		const outerX = props.borderX + props.marginX;
		const outerY = props.borderY + props.marginY;
		const minTX = Math.round(width * outerX);
		const minTY = Math.round(height * outerY);
		const maxTX = Math.round((1 - outerX) * width);
		const maxTY = Math.round((1 - outerY) * height);
		const textWidth = maxTX - minTX + 1;
		const textHeight = maxTY - minTY + 1;
		context.fillStyle = props.borderColor;
		context.fillRect(0, 0, minBX, height);
		context.fillRect(minBX, 0, maxBX - minBX, minBY);
		context.fillRect(maxBX, 0, width - maxBX, height);
		context.fillRect(minBX, maxBY, maxBX - minBX, height - maxBY);
		context.fillStyle = props.backgroundColor;
		context.fillRect(minBX, minBY, maxBX - minBX, maxBY - minBY);
		context.fillStyle = props.textColor;
		context.font = props.font;
		let boundWidth = context.measureText(text).width;
		let boundHeight = ImageFactory.determineFontHeight('font: ' + props.font + ';');
		if(boundWidth > 0 && boundHeight > 0){
			const factorX = textWidth / boundWidth;
			const factorY = textHeight / boundHeight;
			const factor = Math.min(factorX, factorY);
			ImageFactory.multiplyFontSize(context, factor);
			boundWidth = context.measureText(text).width;
			boundHeight = ImageFactory.determineFontHeight('font: ' + context.font + ';');
			let textX;
			if(props.horAlignment === 'middle' || factorX === factor){
				textX = minTX + Math.round((textWidth - boundWidth) / 2);
			}
			else if(props.horAlignment === 'left'){
				textX = minTX;
			}
			else {
				textX = maxTX - Math.round(boundWidth);
			}
			let textY;//this is guessing because the text/line metrics of canvas are experimental -_-
			if(props.verAlignment === 'middle' || factorY === factor){
				textY = minTY + Math.round(boundHeight * ImageFactory.ASSENT_FACTOR + (textHeight - boundHeight) / 2);
			}
			else if(props.verAlignment === 'up'){
				textY = minTY + Math.round(boundHeight * ImageFactory.ASSENT_FACTOR);
			}
			else {
				textY = maxTY - Math.round(boundHeight * (1 - ImageFactory.ASSENT_FACTOR));
			}
			context.fillText(text, textX, textY);
		}
		const image = new Image();
		image.src = canvas.toDataURL();
		return image;
	},
	createTextAreaImage : function(text, props, width, height){
		this.completeTextProperties(props);
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		const minBX = Math.round(width * props.borderX);
		const minBY = Math.round(height * props.borderY);
		const maxBX = Math.round((1 - props.borderX) * width);
		const maxBY = Math.round((1 - props.borderY) * height);
		const outerX = props.borderX + props.marginX;
		const outerY = props.borderY + props.marginY;
		const minTX = Math.round(width * outerX);
		const minTY = Math.round(height * outerY);
		const maxTX = Math.round((1 - outerX) * width);
		const maxTY = Math.round((1 - outerY) * height);
		const textWidth = maxTX - minTX + 1;
		const textHeight = maxTY - minTY + 1;
		context.fillStyle = props.borderColor;
		context.fillRect(0, 0, minBX, height);
		context.fillRect(minBX, 0, maxBX - minBX, minBY);
		context.fillRect(maxBX, 0, width - maxBX, height);
		context.fillRect(minBX, maxBY, maxBX - minBX, height - maxBY);
		context.fillStyle = props.backgroundColor;
		context.fillRect(minBX, minBY, maxBX - minBX, maxBY - minBY);
		context.fillStyle = props.textColor;
		context.font = props.font;
		const words = text.split(' ');
		const spaceWidth = context.measureText(' ').width;
		const wordsCount = words.length;
		const wordLengths = new Array(wordsCount);
		for (let index = 0; index < wordsCount; index++) {
			wordLengths[index] = context.measureText(words[index]).width;
		}
		let wordIndexStart = 0;
		let wordIndexEnd = 0;
		let currentLength = 0;
		let lineIndex = 0;
		const lines = [];
		for (; wordIndexEnd <= wordsCount; wordIndexEnd++) {
			if (wordIndexEnd < wordsCount){
				currentLength += wordLengths[wordIndexEnd];
			}
			if (currentLength > textWidth || wordIndexEnd >= wordsCount) {
				lines[lineIndex] = words[wordIndexStart];
				for (let wordIndex = wordIndexStart + 1; wordIndex < wordIndexEnd; wordIndex++) {
					lines[lineIndex] += ' ' + words[wordIndex];
				}
				console.log('line "' + lines[lineIndex] + '" has length ' + currentLength)
				if (wordIndexEnd < wordsCount){
					lineIndex++;
					wordIndexStart = wordIndexEnd;
					currentLength = wordLengths[wordIndexEnd];
				}
			} else {
				currentLength += spaceWidth;
			}
		}
		console.log('text is ', text);
		console.log('words is ', words);
		console.log('so lines is ', lines);
		console.log('since wordLengths is ', wordLengths);
		const boundHeight = ImageFactory.determineFontHeight('font: ' + context.font + ';');
		let textY = minTY + Math.round(boundHeight * ImageFactory.ASSENT_FACTOR);
		const linesLength = lines.length;
		for (lineIndex = 0; lineIndex < linesLength; lineIndex++) {
			context.fillText(lines[lineIndex], minTX, textY);
			textY += boundHeight;
		}
		const image = new Image();
		image.src = canvas.toDataURL();
		return image;
	},
	completeTextProperties : function(props){
		for(let key in ImageFactory.DEFAULT_TEXT_PROPERTIES){
			if(props[key] === undefined){
				props[key] = ImageFactory.DEFAULT_TEXT_PROPERTIES[key];
			}
		}
	}
};