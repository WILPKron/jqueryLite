"use strict";
(() => {
    const createElementFromHTML = (htmlString) => {
        if (typeof htmlString !== 'string') return htmlString;
        let str = htmlString.replace(/\r?\n/g, '').replace(/\s+/g, ' ').trim();
        let div = document.createElement('div');
        div.innerHTML = str;
        let arr = [].slice.call(div.children);
        return arr.length > 0 ? arr : htmlString;
    }
    const isDom = item => {
        return item.nodeType !== undefined && [3].indexOf(item.nodeType) === -1;
    }
    const whatType = item => {
        return isDom(item) ? 'dom' : toString.call(item).replace('[', '').replace(']', '').split(' ')[1].toLowerCase();
    }
    const readSelector = selector => {
        if (selector === undefined) {
            return Array.from([]);
        }
        let elements = [];
        let selectorTemp = createElementFromHTML(selector);
        let type = whatType(selectorTemp);
        if (type === 'array') selector = selectorTemp;
        switch (type) {
            case 'dom':
                elements = [selector];
                break;
            case 'text':
            case 'string':
                elements = document.querySelectorAll(selector);
                break;
            case 'nodelist':
            case 'array':
                elements = selector;
                break;
            case 'object':
                elements = (type === 'object' && selector.elements !== undefined) ? selector.elements : [];
                break;
        }
        return Array.from(elements);
    };
    const eventTrigger = (element, eventName) => {
        if(['click', 'change', 'blur', 'input'].includes(eventName)) {
            element[eventName]();
        } else {
            const event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, true);
            element.dispatchEvent(event);
        }
    };
    const emptyCallback = () => {};
    const cloneElements = element => {
        const cloneElement = [];
        element.each(item => cloneElement.push(item.cloneNode(true)));
        return cloneElement;
    };
    const serialize = (form, arrayMode = false) => {
        let arr = [];
        Array.prototype.slice.call(form.elements).forEach((field) => {
            if (!field.name || field.disabled || ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1) return;
            if (field.type === 'select-multiple') {
                Array.prototype.slice.call(field.options).forEach((option) => {
                    if (!option.selected) return;
                    arrayMode
                    if (arrayMode) {
                        arr[field.name] = arr[field.name] ?? [];
                        arr[field.name].push(option.value);
                    } else {
                        arr.push(`${encodeURIComponent(field.name)}=${encodeURIComponent(option.value)}`);
                    }
                });
                return;
            }
            if (['checkbox', 'radio'].indexOf(field.type) > -1 && !field.checked) return;
            if (arrayMode) {
                arr[field.name] = arr[field.name] ?? [];
                arr[field.name].push(field.value);
            } else {
                arr.push(`${encodeURIComponent(field.name)}=${encodeURIComponent(field.value)}`);
            }
        });
        return arrayMode ? arr : arr.join('&');
    }
    if (typeof wk === "undefined") window.wk = {};
    wk = function(selector) {
        const elements = readSelector(selector);
        return {
            elements,
            selector,
            html(newHtml) {
                if (newHtml !== undefined) {
                    this.each(element => element.innerHTML = newHtml);
                } else return this.first().innerHTML;
                return this;
            },
            css(newCss) {
                this.each(element => Object.assign(element.style, newCss));
                return this;
            },
            hiden() {
                this.each(element => element.style.display = 'none');
                return this;
            },
            show() {
                this.each(element => element.style.removeProperty('display'));
                return this;
            },
            toggle() {
                this.each(element => {
                    if (element.style.display === 'none') {
                        element.style.removeProperty('display');
                    } else {
                        element.style.display = 'none';
                    }
                });
                return this;
            },
            addClass(className) {
                this.each(element => element.classList.add(className));
                return this;
            },
            removeClass(className) {
                this.each(element => element.classList.remove(className));
                return this;
            },
            toggleClass(className) {
                this.each(element => element.classList.toggle(className));
                return this;
            },
            after(element) {
                const cloneElement = cloneElements(wk(element));
                this.each(el => {
                    cloneElement.forEach(item => el.insertAdjacentElement('afterend', item.cloneNode(true)));
                })
                return this;
            },
            before(element) {
                const cloneElement = cloneElements(wk(element));
                this.each(el => {
                    cloneElement.forEach(item => el.insertAdjacentElement('beforebegin', item.cloneNode(true)));
                });
                return this;
            },
            append(element) {
                const cloneElement = cloneElements(wk(element));
                this.each(el => {
                    cloneElement.forEach(item => el.appendChild(item.cloneNode(true)));
                });
                return this;
            },
            detach() {
                const cloneElement = cloneElements(this);
                this.each(item => item.parentNode.removeChild(item));
                return cloneElement;
            },
            data(key, value) {
                if (key !== undefined) {
                    if (typeof key === 'string' && value !== undefined) {
                        key = { key, value };
                        value = undefined;
                    }
                    if (typeof key === 'string' && value === undefined) {
                        return this.first().dataset[key];
                    } else if (typeof key === 'object' && value === undefined) {
                        this.each(element => Object.assign(element.dataset, key));
                    }
                }
                return this;
            },
            removeData(key) {
                this.each(element => element.removeAttribute(`data-${key}`));
                return this;
            },
            attr(key, value) {
                if (key !== undefined) {
                    if (typeof key === 'string' && value !== undefined) {
                        key = { key, value };
                        value = undefined;
                    }
                    if (typeof key === 'string' && value === undefined) {
                        return this.first().getAttribute(key);
                    } else if (typeof key === 'object' && value === undefined) {
                        this.each(element => {
                            for (let i in key) {
                                element.setAttribute(i, key[i]);
                            }
                        });
                    }
                }
                return this;
            },
            removeAttr(key) {
                this.each(element => element.removeAttribute(key));
                return this;
            },
            on(evt, selector = undefined, handler = undefined) {
                const matchesSelect = (target, selector) => target.matches(selector + ', ' + selector + ' *');
                const isSrting = selector => typeof selector === 'string';
                this.each(element => {
                    element.addEventListener(evt, (event) => {
                        let callback = handler == undefined ? selector : handler;
                        let target = false;
                        if (
                            isSrting(selector) &&
                            matchesSelect(event.target, selector)
                        ) {
                            target = event.target.closest(selector);
                        } else if (
                            isSrting(this.selector) &&
                            matchesSelect(event.target, this.selector) &&
                            selector === undefined
                        ) {
                            target = event.target;
                        }
                        if (target !== false) {
                            callback.apply(target, [event, target]);
                        }
                    });
                });
                return this;
            },
            contains: (element, child) => {
                return element !== child && element.contains(child);
            },
            get: index => {
                index === undefined ? elements : ((elements[index] !== undefined) ? elements[index] : null);
            },
            first: (returnVanilla = true) => {
                return returnVanilla ? elements[0] : wk(elements[0])
            },
            each: (callback = emptyCallback) => {
                elements.forEach(element => callback(element));
            },
            serialize() {
                return serialize(this.first());
            },
            serializeArray() {
                return serialize(this.first(), true);
            },
            eq(index) {
                return index !== undefined ? wk(elements[index]) : undefined;
            },
            clone(element) { 
                this.first().cloneNode(true)
            },
            hasClass(className) { 
                return this.first().classList.contains(className)
            },
            trigger(eventName) { 
                this.each(element => {
                    eventTrigger(element, eventName);
                });
            },
            parent(eventName) {
                return wk(this.first().parentNode)
            },
            parents(selector = false) {
                if (selector === false) {
                    return this.parent();
                }
                return wk(this.first().closest(selector))
            },
            find(selector) {
                return wk(this.first().querySelectorAll(selector))
            },
            children() {
                return wk(this.first().children)
            },
            remove() {
                this.first().parentNode.removeChild(this.first())
            },
        }
    }
    wk.try = (callback = emptyCallback) => {
        try { callback() } catch (e) { console.error(e) }
    },
    wk.declOfNum = (number, words) => {
        return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];
    },
    wk.ready = function(callback = emptyCallback) {
        if (document.readyState !== 'loading') {
            this.try(callback);
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', () => this.try(callback));
        } else {
            document.attachEvent('onreadystatechange', () => {
                if (document.readyState === 'complete') this.try(callback);
            });
        }
        return this;
    },
    wk.urlParams = (query = {}) => {
        const vars = window.location.search.substring(1).split("&");
        if (vars[0] === '') return false;
        vars.forEach((item) => {
            let [key, value] = [...(item.split("="))];
            value = decodeURIComponent(value);
            if (typeof query[key] === "string") query[key] = [query[key]];
            if (typeof query[key] === "undefined") {
                query[key] = value;
            } else {
                query[key].push(value);
            }
        });
        return query;
    }
    wk.ajax = async function (url = '', method = 'GET', body = '', headers = {}, dataType = 'html'/* json|text|html */) {
        let params = {};
        if (url === '' || url === undefined) return false;
        if (method !== '' && method !== undefined) params['method'] = method;
        if (body !== '' && body !== undefined) params['body'] = body;
        if (headers !== {} && headers !== undefined) params['headers'] = headers;
        let response = await
        fetch(url, params);
        if (dataType === 'html') {
            let parser = new DOMParser();
            let doc = await
            parser.parseFromString(await response.text(), 'text/html');
            return await doc;
        } else if (dataType === 'text') {
            return await response.text();
        } else {
            return response.json();
        }
    }
    wk.getObjectValue = (obj, path, split = '.') => {
        const massPath = Array.isArray(path) ? path : path.split(split);
        massPath.forEach(item => obj = obj[item] ? obj[item] : {});
        return obj;
    }
    wk.timeWorkCode = (callback = emptyCallback, id = Symbol("id").toString()) => {
        console.time(id);
        callback();
        console.timeEnd(id);
    }
})();
