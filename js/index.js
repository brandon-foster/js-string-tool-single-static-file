function log(str) {
    console.log(str);
}
const operations = [
    function javaOpts(str) {
        return str.replaceAll(' ', '\n');
    },
    function replaceWithNewLine(str, a) {
        if (a === '') {
            return str;
        }
        return str.replaceAll(a, '\n');
    },
    function jsonParseAndStringify(str) {
        try {
            const obj = JSON.parse(str);
            return JSON.stringify(obj, null, 4);
        }
        catch (e) {
            return null;
        }
    },
    function replace(str, a, b) {
        if (b === '') {
            return str;
        }
        return str.replaceAll(a, b);
    },
    function trim(str) {
        return str.trim();
    },
    function upper(str) {
        return str.toUpperCase();
    },
    function lower(str) {
        return str.toLowerCase();
    },
];
function makeOperationMachine() {
    let opIndex = 0;
    let argc = 1;
    function setArgc(num) {
        argc = num;
    }
    return {
        getMode: function() {
            return opIndex;
        },
        setMode: function(num) {
            opIndex = num;
            if (this.getOpFn().name === 'replace') {
                setArgc(3);
            }
            else if (this.getOpFn().name === 'replaceWithNewLine') {
                setArgc(2);
            }
            else {
                setArgc(1);
            }
        },
        getArgc: function() {
            return argc;
        },
        getOpFn: function() {
            return operations[opIndex];
        },
        getOperations: function() {
            return operations;
        },
    };
};
function makeUi($inputElem, $outputElem, $selectElem, $replaceSrcElem, $replaceDestElem, stringMachine) {
    function setupListeners() {
        $(document).on('paste', $inputElem, function(e) {
            const clipboardText = e.originalEvent.clipboardData.getData('text');
            perform(clipboardText);
        });
        $(document).on('change', $selectElem, function() {
            const opIndex = parseInt($selectElem.val());
            stringMachine.setMode(opIndex);
            if (stringMachine.getArgc() === 3) {
                showReplaceElems();
                $replaceSrcElem.focus();
            }
            else if (stringMachine.getArgc() === 2) {
                showReplaceElems(true, 1);
                $replaceSrcElem.focus();
            }
            else {
                showReplaceElems(false);
            }
            perform();
        });
        $(document).on('keyup', 'textarea, input', function() {
            perform();
        });
    }
    function perform(input = $inputElem.val(), replaceSrc = $replaceSrcElem.val(), replaceDest = $replaceDestElem.val()) {
        const opFn = stringMachine.getOpFn();
        let output = opFn(input, replaceSrc, replaceDest);
        if (output === null) {
            output = 'exception occurred';
        }
        $outputElem.val(output);
    }
    function showReplaceElems(doShow = true, quantity = 2) {
        if (doShow) {
            if (quantity === 1) {
                $replaceSrcElem.show();
            }
            else {
                $replaceSrcElem.show();
                $replaceDestElem.show();
            }
        }
        else {
            $replaceSrcElem.hide();
            $replaceDestElem.hide();
        }
    }
    function populateSelectOptions() {
        function htmlOptionElement(value, text) {
            return '<option value="' + value + '">' + text + '</option>';
        }
        let html = '';
        const operations = stringMachine.getOperations();
        for (let i = 0; i < operations.length; i++) {
            html += htmlOptionElement(i, operations[i].name);
        }
        $selectElem.html(html);
    }
    return (function() {
        showReplaceElems(false);
        setupListeners();
        populateSelectOptions();
        return {
            getInputElem: function() {
                return $inputElem;
            },
        };
    }());
};
$(function() {
    const ui = makeUi($('#input'), $('#output'), $('#select'), $('#replaceSrc'), $('#replaceDest'), makeOperationMachine(operations));
    ui.getInputElem().focus();
});
