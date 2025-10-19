# encoding: utf-8

import sys, os, signal
sys.path.append(os.path.dirname(__file__) + os.sep + '../')
from multiprocessing import Process
import time
from proc import run_fetcher, run_validator
from api import api
import multiprocessing

# 导入单实例管理器
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))
from single_instance import check_single_instance

# 进程锁
proc_lock = multiprocessing.Lock()

# 单实例管理器
instance_manager = None

class Item:
    def __init__(self, target, name):
        self.target = target
        self.name = name
        self.process = None
        self.start_time = 0

def main():
    global instance_manager
    
    # 启动安全检查
    print("🔐 启动 ProxyPool 管理系统...")
    print("=" * 60)
    
    # 检查JWT密钥配置
    try:
        from data.config import JWT_SECRET_KEY, print_security_setup_guide
        print("✅ JWT密钥配置检查通过")
        print(f"✅ 密钥长度: {len(JWT_SECRET_KEY)} 字符")
    except ValueError as e:
        print(f"❌ 安全配置错误: {e}")
        print_security_setup_guide()
        sys.exit(1)
    except Exception as e:
        print(f"❌ 配置加载失败: {e}")
        print_security_setup_guide()
        sys.exit(1)
    
    print("=" * 60)
    
    # 检查单实例运行
    print("🔒 检查单实例运行...")
    
    # 创建单实例管理器
    from utils.single_instance import SingleInstanceManager
    instance_manager = SingleInstanceManager("ProxyPoolWithUI", 5000)
    
    # 尝试获取锁，如果失败会自动清理
    if not instance_manager.acquire_lock():
        print("启动失败：无法获取单实例锁")
        sys.exit(1)
    
    print("单实例检查通过，开始启动服务...")
    
    processes = []
    processes.append(Item(target=run_fetcher.main, name='fetcher'))
    processes.append(Item(target=run_validator.main, name='validator'))
    processes.append(Item(target=api.main, name='api'))

    try:
        while True:
            for p in processes:
                if p.process is None:
                    p.process = Process(target=p.target, name=p.name, daemon=False, args=(proc_lock, ))
                    p.process.start()
                    print(f'启动{p.name}进程，pid={p.process.pid}')
                    p.start_time = time.time()

            for p in processes:
                if p.process is not None:
                    if not p.process.is_alive():
                        print(f'进程{p.name}异常退出, exitcode={p.process.exitcode}')
                        p.process.terminate()
                        p.process = None
                        # 解除进程锁
                        try:
                            proc_lock.release()
                        except ValueError:
                            pass
                    elif p.start_time + 60 * 60 < time.time(): # 最长运行1小时就重启
                        print(f'进程{p.name}运行太久，重启')
                        p.process.terminate()
                        p.process = None
                        # 解除进程锁
                        try:
                            proc_lock.release()
                        except ValueError:
                            pass

            time.sleep(0.2)
    
    except KeyboardInterrupt:
        print("\n收到中断信号，正在停止服务...")
    except Exception as e:
        print(f"系统异常: {e}")
    finally:
        # 清理资源
        print("正在清理资源...")
        for p in processes:
            if p.process is not None and p.process.is_alive():
                print(f"停止 {p.name} 进程...")
                p.process.terminate()
                p.process.join(timeout=5)
                if p.process.is_alive():
                    print(f"强制终止 {p.name} 进程...")
                    p.process.kill()
        
        # 释放单实例锁
        if instance_manager:
            instance_manager.release_lock()
        
        print("系统已安全退出")

def citest():
    """
    此函数仅用于检查程序是否可运行，一般情况下使用本项目可忽略
    """
    global instance_manager
    
    # CI测试时跳过单实例检查，但使用不同的端口
    print("运行CI测试模式...")
    
    processes = []
    processes.append(Item(target=run_fetcher.main, name='fetcher'))
    processes.append(Item(target=run_validator.main, name='validator'))
    processes.append(Item(target=api.main, name='api'))

    for p in processes:
        assert p.process is None
        p.process = Process(target=p.target, name=p.name, daemon=False)
        p.process.start()
        print(f'running {p.name}, pid={p.process.pid}')
        p.start_time = time.time()

    time.sleep(10)

    for p in processes:
        assert p.process is not None
        assert p.process.is_alive()
        p.process.terminate()

if __name__ == '__main__':
    try:
        if len(sys.argv) >= 2 and sys.argv[1] == 'citest':
            citest()
        else:
            main()
        sys.exit(0)
    except Exception as e:
        print('========FATAL ERROR=========')
        print(e)
        sys.exit(1)
