// Operations on Ast
//---------------------------------
let pretty = (ast) => {
	let html  = ''
	if (ast.length) {
		ast.forEach ( (item, i) => {
			html += pretty(item) + '</br>'
		})
	} else {
		if (ast.left) {
			html += pretty(ast.left)
		}
		if (ast.type === 'ident' && ast.mutable) {
			html += `<span class="type-keyword" title="keyword">mut</span> `
		}
		html += `<span class="type-${ast.type}" title="${ast.type}, position: ${ast.pos}">${ast.value}</span> `
		if (ast.right) {
			html += pretty(ast.right)
		}
	}
	return html
}
// outside the function
let vars = {}
let evaluate = function (ast) {
	if (ast.type === 'number') {
		return ast.value
	}
	if (ast.type === 'ident') {
		return vars[ast.value]
	}
	if (ast.type === 'operator') {
		switch (ast.value) {
			case '+': 
				return evaluate(ast.left) + evaluate(ast.right)
			case '-': 
				return evaluate(ast.left) - evaluate(ast.right)
			case '*': 
				return evaluate(ast.left) * evaluate(ast.right)
			case '/': 
				return evaluate(ast.left) / evaluate(ast.right)
			case '=': // przypisanie daje wartosc wyrazenia
				let result = evaluate(ast.right)
				vars[ast.left.value] = result
				return result
		}
	} else {
		throw "Intepreter doesnt support " + ast.type
	}
}
/* From wiki, based on stack and reverse polish notation. I dont use beacouse i have faster way. */
let exe = []
// let compile = function (ast) {
// 	if (ast.length) {
// 		ast.forEach( instr => {
// 			compile(instr)
// 		})
// 	} else 	if (ast.type === 'number') {
// 		exe.push('PUSH ' + ast.value)
// 	} else if (ast.type === 'operator') {
// 		switch (ast.value) {
// 			case '+':
// 				compile(ast.left)
// 				compile(ast.right)
// 				exe.push('POP AX')
// 				exe.push('POP BX')
// 				exe.push('ADD AX BX')
// 				exe.push('PUSH AX')
// 				break
// 			case '-':
// 				compile(ast.left)
// 				compile(ast.right)
// 				exe.push('POP AX')
// 				exe.push('POP BX')
// 				exe.push('SUB AX BX')
// 				exe.push('PUSH AX')
// 				break
// 			case '*':
// 				compile(ast.left)
// 				compile(ast.right)
// 				exe.push('POP AX')
// 				exe.push('POP BX')
// 				exe.push('IMUL AX BX')
// 				exe.push('PUSH AX')
// 				break
// 			case '/':
// 				compile(ast.left)
// 				compile(ast.right)
// 				exe.push('POP AX')
// 				exe.push('POP BX')
// 				exe.push('DIV AX BX')
// 				exe.push('PUSH AX')
// 				break
// 			case '=': // przypisanie daje wartosc wyrazenia
// 				compile(ast.right)
// 				exe.push('POP [' + ast.left.value + ']')
// 				break
// 		}
// 	} else if (ast.type === 'ident') {
// 		exe.push('PUSH ' + ast.value)
//
// 	} else {
// 		throw "Intepreter doesnt support " + ast.type
// 	}
// 	return true
// }

// generate faster code
let registers = ['R15', 'R14', 'R13', 'R12', 'R11', 'R10', 'R9', 'R8']		// availlable registers
let locket_regs = {}														// registers for vars - don't release
let data = {}																//  data['ident'] = register
let compile2 = function (ast)  {
	if (ast.length) {
		ast.forEach( instr => compile2(instr))
	} else 	if (ast.type === 'number') {
		let reg = registers.pop();
		if (!reg) throw "Not enough empty registers"
		exe.push(['MOV', reg, ast.value])
		return reg
	} else if (ast.type === 'operator') {
		let left, right;
		switch (ast.value) {
			case '+': 
				left = compile2(ast.left)
				right = compile2(ast.right)
				exe.push(['ADD', left, right])
				!locket_regs[right] && registers.push(right)
				return left;
			case '-':
				left = compile2(ast.left)
				right = compile2(ast.right)
				exe.push(['SUB', left, right])
				!locket_regs[right] && registers.push(right)
				return left;
			case '*':
				left = compile2(ast.left)
				right = compile2(ast.right)
				exe.push(['IMUL', left, right])
				!locket_regs[right] && registers.push(right)
				return left;
			case '/':
				left = compile2(ast.left)
				right = compile2(ast.right)
				exe.push(['DIV', left, right])
				!locket_regs[right] && registers.push(right)
				return left;
			case '=': // przypisanie daje wartosc wyrazenia
				right = compile2(ast.right)
				data[ast.left.value] = right
				locket_regs[right] = true
				return right;
		}
	} else if (ast.type === 'ident') {
		return data[ast.value]
	} else {
		throw "Intepreter doesn't support " + ast.type
	}
}