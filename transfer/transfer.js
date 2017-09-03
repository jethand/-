$(() => {
    
    /**
     * 大概有两种方法(示例用的第一种方法)
     *  1. 数据驱动型
     *  2. 使用控制变量 showOrHidden
     * 
     *  第一种方法：
     *      函数：
     *          1. fetchDomStrFn()  使用数据，返回渲染字符串模板
     *          2. removeDataFn()   删除已经选择的数据，return剩下的数据
     *          3. joinDataFn()     加入已经选择的数据，return加入后的数据和
     *          4. deepCopyFn()     深拷贝，与$.extend()同理，区分计算变量和遍历变量
     *          5. drawDomByStr()   通过
     *      变量：
     *          1. originData       原始数据
     *          2. afterDeleteData  删除已选择的item后的数据
     *          3. leftDrawData     左侧最终处理的绘制数据
     *          4. rightDrawData    右侧最终处理的绘制数据
     *          5. domStr           dom字符串
     *          6. middleExcessData 中间过渡数据      
     *      操作:
     *          1. ul隐藏
     *          
     */


    // start

    /**
     * selectCheckboxFn
     * @param {domStr}  字符串模板
     * @param {checkbox_select_num_left, checkbox_select_num_right} 已选择的数量初始值
     * @param {leftContainer, rightContainer} 左右两侧jq容器
     * @param {originData}  原始数据
     */

    let [domStr] = [];
    let N = 0;
    let [leftContainer, rightContainer] = [$('.transfer-body-left'), $('.transfer-body-right')];
    let [leftDrawData, rightDrawData] = [];
    let middleExcessData = [];
    let selectedCheckbox = {
        areaCode: '',
        itemCode: ''
    };
    let singleObjFromArr = {
        id: '',
        areaCode: '',
        areaName: '',
        items: []
    };
    const originData = [  
        {   
            "id":1,
            "areaCode":"1",
            "areaName":"备货区",
            "items":[
                {"id":1,"itemCode":"101","itemName":"备货区1"},
                {"id":2,"itemCode":"102","itemName":"备货区2"},
                {"id":3,"itemCode":"103","itemName":"备货区3"},
                {"id":4,"itemCode":"104","itemName":"备货区4"},
                {"id":5,"itemCode":"105","itemName":"备货区5"}
            ]
        },{ 
            "id":2,
            "areaCode":"2",
            "areaName":"拣货区",
            "items":[
                {"id":1,"itemCode":"201","itemName":"拣货区1"},
                {"id":2,"itemCode":"202","itemName":"拣货区2"},
                {"id":3,"itemCode":"203","itemName":"拣货区3"},
                {"id":4,"itemCode":"204","itemName":"拣货区4"}
            ]
        },{ 
            "id":3,
            "areaCode":"3",
            "areaName":"分拣区",
            "items":[
                {"id":1,"itemCode":"301","itemName":"分拣区1"},
                {"id":2,"itemCode":"302","itemName":"分拣区2"},
                {"id":3,"itemCode":"303","itemName":"分拣区3"},
                {"id":4,"itemCode":"304","itemName":"分拣区4"},
            ]
        }
    ];

    /**
     * selectCheckboxFn
     * @param {str}  scope str
     * @param {n} n  计算变量
     * @param {scope} 作用于 
     * @param {isLeft} 控制flag 
     */

    const selectCheckboxFn = (str, scope, isLeft) => {  // checkbox选择处理函数 && 数量计算
        $(document).on('click', str, function(){
            isLeft ? $('.transfer-goLeft').attr('disabled') : $('.transfer-goRight').attr('disabled');
            if($(this).children('input').attr('checked')){
                N --
                $(this).children('input').removeAttr('checked');
            }else{
                N ++;
                $(this).children('input').attr('checked',true);
            }

            if(N > 0){
                if(isLeft){
                    $('.transfer-goLeft').attr('disabled', true).addClass('btn-not-allow');
                    $('.transfer-goRight').attr('disabled', false).removeClass('btn-not-allow')
                }else{
                    $('.transfer-goLeft').attr('disabled', false).removeClass('btn-not-allow');
                    $('.transfer-goRight').attr('disabled', true).addClass('btn-not-allow')
                }
            }else{
                $('.transfer-goLeft').attr('disabled', false).addClass('btn-not-allow');
                $('.transfer-goLeft').attr('disabled', false).addClass('btn-not-allow');
            }
            scope.html(N);
        });
    };


    /**
     * fetchDomStrFn
     * @param {data}  数据对象
     */

    const fetchDomStrFn = (data = {}) => {  // 获取dom字符串处理函数
        let _data = data.concat();
        let _domstr = "";
        _data.forEach(item => {
            _domstr += `<div class='transfer-panel-item'><p class='transfer-panel-item__head active-collapse'>${item.areaName}</p><ul class='transfer-panel-item__wrap'>`;
            item.items.forEach(sitem => {
                _domstr += `<li class='transfer-item-li'><input type='checkbox' itemCode=${sitem.itemCode} areaCode=${item.areaCode} class='transfer-item-checkbox'><span>${sitem.itemName}</span></li>`;
            });
            _domstr += "</ul></div>";
        });
        return _domstr
    };


    /**
     * some function
     * @function {log}  打印函数
     * @function {deepCopy} 深拷贝（对象）函数
     * @function {resetCommonData} 重置一些公用的变量
     */

    const log = (content) => {
        console.log(content);
    };
    const deepCopy = (obj1 = {}, obj2) => { // 深拷贝
        // obj1 待被拷贝对象 obj2 返回对象
        for (var key in obj2) { 
            if(obj2.hasOwnProperty(key)){ 
                if(typeof obj2[key] == 'object') { 
                    obj1[key] = Array.isArray(obj2[key])?[]:{};
                    deepCopy(obj1[key],obj2[key]); //递归处理
                }else{
                    obj1[key] = obj2[key]; 
                }
            }
        }  
        return obj1
    };
    const resetCommonData = () => {
        middleExcessData = []; // 重置中间过渡变量
    };

    /**
     * fetchSelectData 筛选出来选择的项，还原为源数据的数据格式
     * @param {parentData}  父级数据
     * @param {scope} 作用域
     * @param {middleExcessData} 中间过渡数据
     * @param {leftDrawData} 左侧列表已有数据
     * @param {selectedCheckbox} 被选中的checkbox的基础信息
     * @param {singleObjFromArr} 数组数据的单个对象
     */
    const fetchSelectData = (parentData, scope) => {
        let _data = parentData.concat();
        let CALNUM = 0;
        let [length, _length, __length] = [scope.length, 0, _data.length];
        let numChangeFlag = false;
        let middleExcessData = [];
        if(length === 0) return;
        resetCommonData(); // 重置共用变量
        for(let i = 0; i< length; i++){
            if(scope[i].getAttribute('checked')){
                selectedCheckbox = { // 此时存在的被选中的checkbox
                    areaCode: scope[i].getAttribute('areaCode'),
                    itemCode: scope[i].getAttribute('itemCode')
                };
                for(let m=0; m< __length; m++){ // 寻找该条记录的位置，使用for而不用forEach是为了节省性能
                    if(_data[m].areaCode === selectedCheckbox.areaCode){
                        for(let n=0; n< _data[m].items.length; n++){
                            if(_data[m].items[n].itemCode === selectedCheckbox.itemCode){ // 当areaCode和itemCode都符合时
                                singleObjFromArr = {
                                    id: _data[m].id,
                                    areaCode: _data[m].areaCode,
                                    areaName: _data[m].areaName,
                                    items: []
                                };
                                singleObjFromArr.items.push(_data[m].items[n]); // 一条完整格式的数据已经形成，singleObjFromArr的items永远只会有一条记录
                                // 拿singleObjFromArr 和 middleExcessData 进行比对，进行数据的迁移
                                if(middleExcessData.length === 0){ 
                                    middleExcessData.push(singleObjFromArr);
                                }else{
                                    // 不能保存长度，否则会造成数据丢失
                                    for(let j=CALNUM;j< middleExcessData.length; j++){ 
                                        // 一定用CALNUM做起点，否则会造成数据重复，这一个点才是本函数的精髓所在
                                        if(middleExcessData[j].areaCode === selectedCheckbox.areaCode){ 
                                            middleExcessData[j].items.push(singleObjFromArr.items[0]) 
                                            break;
                                        }else{
                                            CALNUM ++;
                                        }
                                        if(CALNUM === middleExcessData.length){ // 未匹配到，need push new area
                                            middleExcessData.push(singleObjFromArr);
                                            break;
                                        }
                                    }
                                }
                            }
                        };
                        break;
                    }
                };
            }
        }
        return middleExcessData;
    };


    /**
     *  通用的两个函数
     * @param {fetchAfterRemoveData}  获取删除后的数据
     * @param {fetchAfterRemoveData}  获取添加后的数据
     */
    
    const fetchAfterRemoveData = (parentData, middleExcessData) => {
        let　_data =$.map(parentData, function(obj){
            return $.extend(true, {}, obj);
        });;
        let _middleExcessData = parentData.concat();
        let [PINDEX, CINDEX] = [0, 0];
        _data.forEach((item, idx) => {
            if(PINDEX < middleExcessData.length){
                if(item.areaCode === middleExcessData[PINDEX].areaCode){
                    item.items.forEach((sitem, sidx) => {
                        if(CINDEX < middleExcessData[PINDEX].items.length){
                            if(sitem.itemCode === middleExcessData[PINDEX].items[CINDEX].itemCode){
                                _middleExcessData[idx].items.splice(sidx - CINDEX, 1);
                                CINDEX++;
                            }
                        }
                    });
                    PINDEX++;
                    CINDEX = 0;
                }
            }
        });
        return _middleExcessData;
    };
    const fetchAfterJoinData = (parentData, middleExcessData) => {
        if(!rightDrawData) return middleExcessData
        let _middleExcessData = middleExcessData.concat();
        let _parentData = parentData.concat();
        let ISMATCH = false;
        _middleExcessData.forEach((item, idx) => {
            ISMATCH = false;
            parentData.forEach((_item, _idx) => {
                if(item.areaCode === _item.areaCode){
                    _parentData[_idx].items = _parentData[_idx].items.concat(middleExcessData[idx].items);
                    ISMATCH = true;
                }
                if(_idx + 1 === parentData.length && !ISMATCH){
                    _parentData = _parentData.concat(middleExcessData[idx])
                }
            })
        });
        return _parentData;
    };


    // page init && binding
    $(document).on('click', '.transfer-panel-item__head', function(){
        $(this).siblings('ul').toggle();
    });


    // 事件绑定
    selectCheckboxFn('.transfer-body-left .transfer-item-li', $('.transfer-panel-foot_leftnum'), true);
    selectCheckboxFn('.transfer-body-right .transfer-item-li', $('.transfer-panel-foot_rightnum'), false);

    // 页面初始化的基础数据赋值 和 
    $('.transfer-panel-foot_leftnum').html(N);
    $('.transfer-panel-foot_rightnum').html(N);
    $('.transfer-goLeft').attr('disabled', true).addClass('btn-not-allow');
    $('.transfer-goRight').attr('disabled', true).addClass('btn-not-allow');

    leftDrawData = originData.concat(); // 所有的操作都基于leftDrawData，rightDrawData

    // 生成左侧dom
    leftContainer.append(fetchDomStrFn(originData));


    // 每次点击按钮要做的事情分别是： 1.找出筛选出来的数据 2.获取被剔除后的剩余数据 3.获取加上筛选数据后的综合数据 4.两侧dom重绘 

    $('.transfer-goRight').click(() => {
        middleExcessData = fetchSelectData(leftDrawData, $('.transfer-body-left .transfer-item-checkbox')); // 筛选出来的数据
        leftDrawData = fetchAfterRemoveData(leftDrawData, middleExcessData); // 获取被剔除后的剩余数据
        rightDrawData = fetchAfterJoinData(rightDrawData, middleExcessData);
        leftContainer.empty().append(fetchDomStrFn(leftDrawData)); // 清空dom并重新渲染
        rightContainer.empty().append(fetchDomStrFn(rightDrawData)); 
        $('.transfer-goRight').attr('disabled', true).addClass('btn-not-allow');
        N = 0;
        $('.transfer-panel-foot_leftnum').html(N);
    });

    $('.transfer-goLeft').click(() => {
        middleExcessData = fetchSelectData(rightDrawData, $('.transfer-body-right .transfer-item-checkbox')); // 筛选出来的数据
        rightDrawData = fetchAfterRemoveData(rightDrawData, middleExcessData);// 获取被剔除后的剩余数据
        leftDrawData = fetchAfterJoinData(leftDrawData, middleExcessData);
        leftContainer.empty().append(fetchDomStrFn(leftDrawData)); // 清空dom并重新渲染
        rightContainer.empty().append(fetchDomStrFn(rightDrawData)); 
        $('.transfer-goLeft').attr('disabled', true).addClass('btn-not-allow');
        N = 0;
        $('.transfer-panel-foot_rightnum').html(N);
    });
});