let tokenize = (code) => {
	let tokens = [],
		current = 0
		
	// pobranie jednego tokena
	let getToken = function () {
		let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
			digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
			token = {
				type: '',
				value: '',
				pos: 0
			}
		
		while (token.type == '' && current < code.length) {
			token.pos = current			
			let c = code[current]; 	current++;	
			token.value = c
			
			if (letters.indexOf(c) !== -1) {
				token.type = 'ident';
				while (letters.indexOf(code[current]) !== -1) {
					c = code[current]; current++
					token.value += c
				}
			}else if (digits.indexOf(c) !== -1) {
				token.type = 'number';
				while (digits.indexOf(code[current]) !== -1) {
					c = code[current]; current++
					token.value += c
				}
				token.value = parseInt(token.value)
			} else if (c === '+' || c === '-' || c === '*' || c === '/' || c === '=') {
				token.type = 'operator'
			} else if (c === ' ' || c === '\t' || c === '\r') {
				while (code[current] === ' ' || code[current] === '\t') {
					c = code[current]; current++
					token.value += c
				}
			} else if (c === '(') {
				token.type = 'lparensis'
				token.value = c
			} else if (c === ')') {
				token.type = 'rparensis'
				token.value = c
			} else if (c === '\n') {
				token.type = 'nl'
				// usuwam powtorzenia
				while (code[current] === '\n') {
					c = code[current]; current++
				}
			} else {
				throw 'Tokenizer: Nieprawidlowy token ' + c + ' na pozycji ' + current
			}
		}
		return token.type ? token : null;
	}
	
	let currentToken;
	while (currentToken = getToken()) {
		tokens.push(currentToken);
	}

	return tokens
}
let parse = (tokens) => {
	let current = 0
	let factor = function () {
		let token = tokens[current++];
		if (token.type === 'number' || token.type === 'ident') {
			return token		
		} else if (token.type === 'lparensis') {
			let result = expression()
				
			if (tokens[current].type === 'rparensis') {
				current++
				return result
			} else {
				throw "Spodziewany ')' na pozycji " + current
			}
			
		} else {
			throw 'Spodziewany number lub zmienna lub ( na pozycji ' + token.pos
		}	
	}
	let term = function () {
		let result = factor();
		let op = tokens[current]; // uwaga nie zwiekszamy jeszcze
		while (op && op.type === 'operator' && (op.value === '*' || op.value === '/')) {
			current++
			op.left = result
			op.right = factor()
			result = op
			
			op = tokens[current]
		}
		return result
	}
	let expression  = function() {
		let result = term() 
		let op = tokens[current]; // uwaga nie zwiekszamy jeszcze
		while (op && op.type === 'operator' && (op.value === '+' || op.value === '-')) {
			current++
			op.left = result
			op.right = term()
			result = op
			
			op = tokens[current]
		}
		return result
	}
	let assign = function () {
		let result = undefined
		let variable = tokens[current++]
		
		if (variable.value === 'mut') {
			variable = tokens[current++]
			variable.mutable = true
		} 
		let op = tokens[current]
		if (op && op.type === 'operator' && op.value === '=') {
			current++
			op.left = variable
			op.right = expression()
			result = op
		}
		return result;
		
	}
	let instruction = function() {
		// TODO zabezpieczyc przed 1 = 3 + 3 -> wpada w expression i zatrzymuje sie na '='
		return  tokens[current].type === 'ident' ? assign() : expression();
	}
	let instructions = function () {
		let result = [instruction()]
		let nextist = tokens[current] 			// TODO fix nl and inc nextinst
		while (nextist && nextist.type === 'nl' && tokens[current + 1]) {
			current++
			result.push (instruction())
		}
		console.dir(result)
		window.instructions = result;
		return result;
	}
	
	return instructions()
}