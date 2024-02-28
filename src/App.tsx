import React from 'react';
import {useState, useRef, useEffect} from 'react';
import {
    BellOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ArrowsAltOutlined,
    ShrinkOutlined,
    CaretRightOutlined,
    PauseOutlined,
    StopOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import './App.css';
import {Button, Col, Row, message, Input, Table, Tooltip} from 'antd';
import {CSSTransition} from 'react-transition-group'
import 'animate.css'
import {
    getElevatorInfoApi,
    openDoorApi,
    closeDoorApi,
    startElevatorApi,
    stopElevatorApi,
    callElevatorInsideApi, callElevatorOutsideApi, pauseElevatorApi
} from './backendApi'


function App() {
    const [pushedButtons, setPushedButtons] = useState<number[]>([])
    const [inputValue, setInputValue] = useState(1)
    const [floorData, setFloorData] = useState<any[]>([])
    const [floorDataCurrent, setFloorDataCurrent] = useState<any[]>([])
    const [floorDataIsUp, setFloorDataIsUp] = useState<any[]>([])
    const [currentFloor, setCurrentFloor] = useState(1)
    const [isUp, setIsUp] = useState(1)
    const [peopleCount, setPeopleCount] = useState(0)
    const [personData, setPersonData] = useState<any[]>([])
    const [personDataTarget, setPersonDataTarget] = useState<any[]>([])
    const [personDataIsUp, setPersonDataIsUp] = useState<any[]>([])
    const [doorOpenStatus, setDoorOpenStatus] = useState(0)
    const [doorCloseStatus, setDoorCloseStatus] = useState(0)
    const [show, setShow] = useState(true)
    const [elevatorStart, setElevatorStart] = useState(0)

    useEffect(() => {
        const floor_idx = floorDataCurrent.indexOf(currentFloor)
        // console.log('useEffect --- floorDataIsUp[floor_idx] === isUp : ', floorDataIsUp[floor_idx] === isUp)
        if (floor_idx !== -1 && floorDataIsUp[floor_idx] === isUp) {
            console.log('进入电梯 : ', currentFloor)
            openDoorFunc();
        }

        const people_idx = personDataTarget.indexOf(currentFloor)
        // console.log('useEffect --- personDataIsUp[people_idx] === isUp : ', personDataIsUp[people_idx] === isUp)
        if (people_idx !== -1 && personDataIsUp[people_idx] === isUp) {
            console.log('出电梯 : ', currentFloor)
            openDoorFunc();
        }
    }, [currentFloor, isUp]);

    const getElevatorInfoFunc = () => {
        setShow(false)
        getElevatorInfoApi({}).then((res) => {
            if (res.data.msg === 'success') {
                const data = res.data.data
                setCurrentFloor(data.current_floor)
                setIsUp(data.is_up)
                setPeopleCount(data.persons)
                setPersonData(data.person_data)
                setFloorData(data.building_floor_data)

                let newArray1: any = []
                let newArray2: any = []
                data.building_floor_data.forEach((item: any) => {
                    newArray1.push(item.current_floor)
                    newArray2.push(item.is_up)
                })
                setFloorDataCurrent(newArray1)
                setFloorDataIsUp(newArray2)

                let newArray3: any = []
                let newArray4: any = []
                data.person_data.forEach((item: any) => {
                    newArray3.push(item.target_floor)
                    newArray4.push(item.is_up)
                })
                setPersonDataTarget(newArray3)
                setPersonDataIsUp(newArray4)

                let newArray: any = []
                data.person_data.forEach((item: any) => {
                    if (pushedButtons.indexOf(item.target_floor) === -1) {
                        newArray.push(item.target_floor)
                    }
                })
                setPushedButtons(newArray)

                if (data.person_data.length === 0 && data.building_floor_data.length === 0) {
                    clearInterval(intervalHandle.current);
                    setElevatorStart(0)
                }
            } else {
                message.error('Elevator did`t start yet');
            }
        }).finally(() => {
            setShow(true)
        })
    }

    const floorDataCol = [
        {
            title: 'Current',
            dataIndex: 'current_floor',
            key: 'current_floor',
        },
        {
            title: 'Target',
            dataIndex: 'target_floor',
            key: 'target_floor',
        },
        {
            title: 'Is Up',
            dataIndex: 'is_up',
            key: 'is_up',
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
        },
    ];

    let arrow;
    if (isUp) {
        arrow = <ArrowUpOutlined style={{color: '#c4fa14', marginRight: '95px'}}/>
    } else {
        arrow = <ArrowDownOutlined style={{color: '#c4fa14', marginRight: '95px'}}/>
    }

    const emergency = () => {
        message.warning('Have an emergency!');
    }

    const targetGo = (target_floor: number) => {
        setPushedButtons([...pushedButtons, target_floor])
        callElevatorInsideApi({current_floor: currentFloor, target_floor: target_floor}).then((res) => {
            const data = res.data.data
            setPeopleCount(data.persons)
            setPersonData(data.person_data)
            setFloorData(data.building_floor_data)

            let newArray1: any = []
            let newArray2: any = []
            data.building_floor_data.forEach((item: any) => {
                newArray1.push(item.current_floor)
                newArray2.push(item.is_up)
            })
            setFloorDataCurrent(newArray1)
            setFloorDataIsUp(newArray2)

            let newArray3: any = []
            let newArray4: any = []
            data.person_data.forEach((item: any) => {
                newArray3.push(item.target_floor)
                newArray4.push(item.is_up)
            })
            setPersonDataTarget(newArray3)
            setPersonDataIsUp(newArray4)

            if (!elevatorStart) {
                startElevatorFunc('no')
            }
        })
    }

    const callElevatorFromOutside = (is_up: number) => {
        if (is_up && inputValue === 10) {
            message.warning('You are on the highest floor!')
            return false
        }
        if (!is_up && inputValue === -1) {
            message.warning('You are on the lowest floor!')
            return false
        }
        callElevatorOutsideApi({current_floor: inputValue, is_up: is_up}).then((res) => {
            const data = res.data.data
            setFloorData(data.building_floor_data)

            let newArray1: any = []
            let newArray2: any = []
            data.building_floor_data.forEach((item: any) => {
                newArray1.push(item.current_floor)
                newArray2.push(item.is_up)
            })
            setFloorDataCurrent(newArray1)
            setFloorDataIsUp(newArray2)

            let newArray3: any = []
            let newArray4: any = []
            data.person_data.forEach((item: any) => {
                newArray3.push(item.target_floor)
                newArray4.push(item.is_up)
            })
            setPersonDataTarget(newArray3)
            setPersonDataIsUp(newArray4)

            if (!elevatorStart) {
                startElevatorFunc('no')
            }
        })
    }

    const deleteButtonFromPushed = (floor: number) => {
        let newArray = [...pushedButtons]
        const idx = newArray.indexOf(floor)
        if (idx !== -1) {
            newArray.splice(idx, 1);
        }
        setPushedButtons(newArray)
    }

    const openDoorFunc = () => {
        setDoorOpenStatus(1)
        // message.warning('Door is opening, currentFloor : ' + currentFloor.toString());
        openDoorApi({}).then((res) => {
            // deleteButtonFromPushed(currentFloor)
            setDoorOpenStatus(0)
            closeDoorFunc()
        })
    }

    const closeDoorFunc = () => {
        setDoorCloseStatus(1)
        // message.warning('Door is closing');
        closeDoorApi({}).then((res) => {
            setDoorCloseStatus(0)
            // startElevatorFunc('no')
        })
    }

    const buttons = [];
    for (let i = 10; i >= 0; i -= 2) {
        if (i === 0) {
            buttons.push(<div key={i}>
                <Button onClick={() => targetGo(i - 1)}
                        className={pushedButtons.indexOf(i - 1) === -1 ? 'left-button' : 'left-button-hover'}>{i - 1}</Button>
                <Button onClick={() => emergency()} className='right-button' type='primary'
                        danger><BellOutlined/></Button>
            </div>)
        } else {
            buttons.push(<div key={i}>
                <Button onClick={() => targetGo(i - 1)}
                        className={pushedButtons.indexOf(i - 1) === -1 ? 'left-button' : 'left-button-hover'}>{i - 1}</Button>
                <Button onClick={() => targetGo(i)}
                        className={pushedButtons.indexOf(i) === -1 ? 'right-button' : 'right-button-hover'}>{i}</Button>
            </div>)
        }
    }

    function isNumber(v: any) {
        return typeof v === 'number' && !isNaN(v);
    }

    const handleChange = (value: string) => {
        if (!isNumber(parseInt(value))) {
            message.error('Input value is not number');
            return false
        } else {
            if (parseInt(value) === 0) {
                message.error('No floor 0');
                return false
            } else if (parseInt(value) >= -1 && parseInt(value) <= 10) {
                setInputValue(parseInt(value))
            } else {
                message.error('Input value should be less than 10 and larger than -1');
                return false
            }
        }

    }

    let intervalHandle = useRef();

    const startElevatorFunc = (generate_person = 'yes') => {
        if (!elevatorStart) {
            try {
                startElevatorApi({generate_person: generate_person}).then(res => {
                    message.success(res.data.msg);
                    const data = res.data.data
                    setElevatorStart(1)
                    setCurrentFloor(data.current_floor)
                    setIsUp(data.is_up)
                    setPeopleCount(data.persons)
                    setPersonData(data.person_data)
                    setFloorData(data.building_floor_data)

                    let newArray1: any = []
                    let newArray2: any = []
                    data.building_floor_data.forEach((item: any) => {
                        newArray1.push(item.current_floor)
                        newArray2.push(item.is_up)
                    })
                    setFloorDataCurrent(newArray1)
                    setFloorDataIsUp(newArray2)

                    let newArray3: any = []
                    let newArray4: any = []
                    data.person_data.forEach((item: any) => {
                        newArray3.push(item.target_floor)
                        newArray4.push(item.is_up)
                    })
                    setPersonDataTarget(newArray3)
                    setPersonDataIsUp(newArray4)

                    // @ts-ignore
                    intervalHandle.current = setInterval(getElevatorInfoFunc, 3000);
                })
            } catch (e) {
                console.log(e)
                message.error('startElevatorFunc failed')
            }
        } else {
            message.warning('Elevator is already started!');
        }
    }

    const stopElevatorFunc = () => {
        stopElevatorApi({}).then(res => {
            message.success(res.data.msg);
            setElevatorStart(0)
            const data = res.data.data
            setCurrentFloor(data.current_floor)
            setIsUp(data.is_up)
            setPeopleCount(data.persons)
            setPersonData(data.person_data)
            setFloorData(data.building_floor_data)

            let newArray1: any = []
            let newArray2: any = []
            data.building_floor_data.forEach((item: any) => {
                newArray1.push(item.current_floor)
                newArray2.push(item.is_up)
            })
            setFloorDataCurrent(newArray1)
            setFloorDataIsUp(newArray2)

            let newArray3: any = []
            let newArray4: any = []
            data.person_data.forEach((item: any) => {
                newArray3.push(item.target_floor)
                newArray4.push(item.is_up)
            })
            setPersonDataTarget(newArray3)
            setPersonDataIsUp(newArray4)

            setPushedButtons([])
        })
        clearInterval(intervalHandle.current);
    }

    const pauseElevatorFunc = () => {
        pauseElevatorApi({}).then(res => {
            message.success(res.data.msg);
            setElevatorStart(0)
        })
    }

    useEffect(() => {
        return () => {
            clearInterval(intervalHandle.current);
        };
    }, [])

    const floorColor = (record: any) => {
        return record.current_floor === currentFloor && record.is_up === isUp ? 'special-row' : ''
    }
    const personColor = (record: any) => {
        return record.target_floor === currentFloor ? 'special-row' : ''
    }

    return (
        <div className="App">
            <Row>
                <Col span={4} offset={1}>
                    <div className="outside-elevator">
                        <div>*Outside the elevator*</div>
                        <div className="one-button" style={{marginBottom: '50px'}}>
                            <Tooltip title="Start the elevator and generate random people." color='cyan' key='cyan1' placement="bottom">
                                <Button onClick={() => startElevatorFunc()} className='up-button'
                                        style={{
                                            backgroundColor: '#fffb8f',
                                            marginTop: '8px',
                                            marginRight: '10px'
                                        }}><PlayCircleOutlined/></Button>
                            </Tooltip>
                            <Tooltip title="Stop and reset the elevator." color='cyan' key='cyan2' placement="bottom">
                                <Button onClick={() => stopElevatorFunc()} className='up-button'
                                        style={{
                                            backgroundColor: '#ff7875',
                                            marginTop: '8px',
                                            marginRight: '10px'
                                        }}><StopOutlined/></Button>
                            </Tooltip>

                            <Tooltip title="Restart" color='cyan' key='cyan3' placement="bottom">
                                <Button onClick={() => startElevatorFunc('no')} className='up-button'
                                        style={{
                                            backgroundColor: '#fffb8f',
                                            marginTop: '8px',
                                            marginRight: '10px'
                                        }}><CaretRightOutlined/></Button>
                            </Tooltip>
                            <Tooltip title="Pause" color='cyan' key='cyan4' placement="bottom">
                                <Button onClick={() => pauseElevatorFunc()} className='up-button'
                                        style={{
                                            backgroundColor: elevatorStart ? '#fffb8f' : '#ff7875',
                                            marginTop: '8px'
                                        }}><PauseOutlined/></Button>
                            </Tooltip>
                        </div>
                        <div className="one-button">
                            <Input size="large" value={inputValue} onChange={(e) => handleChange(e.target.value)}
                                   className="input-num"/>
                        </div>
                        <div className="one-button">
                            <Button onClick={() => callElevatorFromOutside(1)} className='up-button'
                                    style={{backgroundColor: '#bfbfbf', marginTop: '8px'}}><ArrowUpOutlined/></Button>
                        </div>
                        <div className="one-button">
                            <Button onClick={() => callElevatorFromOutside(0)} className='down-button'
                                    style={{backgroundColor: '#bfbfbf', marginTop: '8px'}}><ArrowDownOutlined/></Button>
                        </div>
                    </div>
                </Col>

                <Col span={6} offset={1} className="flow-col">
                    <div className="outside-elevator">
                        <div style={{marginBottom: '20px'}}>*Floor Data*</div>
                        <div className="one-line">
                            <span>People Outside :&nbsp;&nbsp;{floorData.length}</span>
                        </div>
                        <div style={{marginTop: '30px'}}>
                            <Table dataSource={floorData} columns={floorDataCol} rowClassName={floorColor} rowKey={"weight"}/>
                        </div>
                    </div>
                </Col>
                <Col span={3} offset={1}>
                    <div className="elevator">
                        <div className="title">
                            <div className="current-floor">
                                <CSSTransition
                                    in={show}
                                    classNames="box"
                                    timeout={1000}
                                    unmountOnExit
                                    appear>
                                    <span>{currentFloor}</span>
                                </CSSTransition>
                            </div>
                            <div style={{display: "inline-block"}}>{arrow}</div>
                        </div>
                        {buttons}
                        <div>
                            <Button onClick={() => openDoorFunc()}
                                    className={doorOpenStatus === 1 ? 'open-button-hover' : 'left-button'}
                                    style={{marginTop: '16px'}}><ArrowsAltOutlined
                                className="rotate"/></Button>
                            <Button onClick={() => closeDoorFunc()}
                                    className={doorCloseStatus === 1 ? 'close-button-hover' : 'right-button'}
                                    style={{marginTop: '16px'}}><ShrinkOutlined
                                className="rotate"/></Button>
                        </div>
                    </div>
                </Col>
                <Col span={6} offset={1}>
                    <div className="outside-elevator">
                        <div style={{marginBottom: '20px'}}>*Elevator Status*</div>
                        <div className="one-line">
                            <span>People Inside :&nbsp;&nbsp;{peopleCount}</span>
                        </div>
                        <div style={{marginTop: '30px'}}>
                            <Table dataSource={personData} columns={floorDataCol} rowClassName={personColor} rowKey={"weight"}/>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default App;
